import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRoutingDto,
  ForwardRoutingDto,
  VerifyRoutingDto,
  RejectRoutingDto,
  AddParticipantDto,
  AddCommentDto,
  CompleteRoutingDto,
} from './dto';
import { MailRoutingStatus, MailActionType, ParticipantRole, DocumentStatus } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class MailRoutingService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  /**
   * Initialize routing for a document (réception du courrier)
   */
  async initializeRouting(dto: CreateRoutingDto, currentUserId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: dto.documentId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Create routing
    const routing = await this.prisma.mailRouting.create({
      data: {
        documentId: dto.documentId,
        initiatedById: currentUserId,
        currentAssigneeId: currentUserId,
        status: MailRoutingStatus.pending,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
      include: {
        participants: true,
        initiatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Add initiator as receiver
    await this.prisma.mailParticipant.create({
      data: {
        routingId: routing.id,
        userId: currentUserId,
        role: ParticipantRole.receiver,
      },
    });

    // Log audit
    await this.prisma.mailAuditTrail.create({
      data: {
        routingId: routing.id,
        actorId: currentUserId,
        action: 'ROUTING_INITIALIZED',
        newValues: JSON.stringify({ status: MailRoutingStatus.pending }),
      },
    });

    // Update document status
    await this.prisma.document.update({
      where: { id: dto.documentId },
      data: { status: DocumentStatus.received },
    });

    // Activity log
    await this.activityLog.log({
      action: 'MAIL_ROUTING_INITIALIZED',
      entity: 'MailRouting',
      entityId: routing.id,
      entityLabel: `Routing for ${doc.title}`,
      userId: currentUserId,
      userName: (await this.prisma.user.findUnique({ where: { id: currentUserId } }))?.name,
      userRole: (await this.prisma.user.findUnique({ where: { id: currentUserId } }))?.role,
    });

    return routing;
  }

  /**
   * Forward document to next person (Chef bureau envoie à autre)
   */
  async forward(routingId: string, dto: ForwardRoutingDto, currentUserId: string) {
    const routing = await this.validateRoutingAccess(routingId, currentUserId, 'forward');

    if (routing.status === MailRoutingStatus.rejected) {
      throw new BadRequestException('Cannot forward rejected routing');
    }

    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver user not found');
    }

    // Add primary receiver
    await this.prisma.mailParticipant.create({
      data: {
        routingId,
        userId: dto.receiverId,
        role: ParticipantRole.receiver,
      },
    });

    // Add CC if provided
    if (dto.ccUserIds?.length) {
      for (const ccUserId of dto.ccUserIds) {
        const ccUser = await this.prisma.user.findUnique({ where: { id: ccUserId } });
        if (!ccUser) continue;

        await this.prisma.mailParticipant.upsert({
          where: {
            routingId_userId_role: {
              routingId,
              userId: ccUserId,
              role: ParticipantRole.cc,
            },
          },
          create: {
            routingId,
            userId: ccUserId,
            role: ParticipantRole.cc,
          },
          update: {},
        });
      }
    }

    // Update routing status
    const updatedRouting = await this.prisma.mailRouting.update({
      where: { id: routingId },
      data: {
        status: MailRoutingStatus.forwarded,
        currentAssigneeId: dto.receiverId,
        updatedAt: new Date(),
      },
      include: {
        participants: true,
        document: true,
        currentAssignee: { select: { id: true, name: true, email: true } },
      },
    });

    // Log action
    await this.prisma.mailRoutingAction.create({
      data: {
        routingId,
        actorId: currentUserId,
        actionType: MailActionType.forward,
        targetUserId: dto.receiverId,
        previousStatus: routing.status,
        newStatus: MailRoutingStatus.forwarded,
        note: dto.note,
      },
    });

    // Audit trail
    await this.prisma.mailAuditTrail.create({
      data: {
        routingId,
        actorId: currentUserId,
        action: 'DOCUMENT_FORWARDED',
        newValues: JSON.stringify({
          status: MailRoutingStatus.forwarded,
          receiver: dto.receiverId,
          ccs: dto.ccUserIds,
        }),
      },
    });

    // Activity log
    const actor = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    await this.activityLog.log({
      action: 'MAIL_FORWARDED',
      entity: 'MailRouting',
      entityId: routingId,
      entityLabel: `Forwarded to ${receiver.name}`,
      userId: currentUserId,
      userName: actor?.name,
      userRole: actor?.role,
    });

    return updatedRouting;
  }

  /**
   * Verify document (destinataire valide)
   */
  async verify(routingId: string, dto: VerifyRoutingDto, currentUserId: string) {
    const routing = await this.validateRoutingAccess(routingId, currentUserId, 'verify');

    const updatedRouting = await this.prisma.mailRouting.update({
      where: { id: routingId },
      data: {
        status: MailRoutingStatus.verified,
        updatedAt: new Date(),
      },
      include: { participants: true, document: true },
    });

    // Mark current user as completed
    await this.prisma.mailParticipant.updateMany({
      where: {
        routingId,
        userId: currentUserId,
        role: ParticipantRole.receiver,
      },
      data: { completedAt: new Date() },
    });

    // Log action
    await this.prisma.mailRoutingAction.create({
      data: {
        routingId,
        actorId: currentUserId,
        actionType: MailActionType.verify,
        previousStatus: routing.status,
        newStatus: MailRoutingStatus.verified,
        note: dto.note,
      },
    });

    // Activity log
    const actor = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    await this.activityLog.log({
      action: 'MAIL_VERIFIED',
      entity: 'MailRouting',
      entityId: routingId,
      entityLabel: `Mail verified`,
      userId: currentUserId,
      userName: actor?.name,
      userRole: actor?.role,
    });

    return updatedRouting;
  }

  /**
   * Reject document (renvoyer)
   */
  async reject(routingId: string, dto: RejectRoutingDto, currentUserId: string) {
    const routing = await this.validateRoutingAccess(routingId, currentUserId, 'reject');

    const updatedRouting = await this.prisma.mailRouting.update({
      where: { id: routingId },
      data: {
        status: MailRoutingStatus.rejected,
        updatedAt: new Date(),
      },
      include: { participants: true },
    });

    // Log action
    await this.prisma.mailRoutingAction.create({
      data: {
        routingId,
        actorId: currentUserId,
        actionType: MailActionType.reject,
        previousStatus: routing.status,
        newStatus: MailRoutingStatus.rejected,
        note: dto.rejectionReason,
      },
    });

    // Activity log
    const actor = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    await this.activityLog.log({
      action: 'MAIL_REJECTED',
      entity: 'MailRouting',
      entityId: routingId,
      entityLabel: `Mail rejected: ${dto.rejectionReason}`,
      userId: currentUserId,
      userName: actor?.name,
      userRole: actor?.role,
    });

    return updatedRouting;
  }

  /**
   * Return document to sender for correction
   */
  async returnToSender(routingId: string, dto: VerifyRoutingDto, currentUserId: string) {
    const routing = await this.validateRoutingAccess(routingId, currentUserId, 'return');

    const updatedRouting = await this.prisma.mailRouting.update({
      where: { id: routingId },
      data: {
        status: MailRoutingStatus.returned,
        updatedAt: new Date(),
      },
      include: { participants: true },
    });

    // Log action
    await this.prisma.mailRoutingAction.create({
      data: {
        routingId,
        actorId: currentUserId,
        actionType: MailActionType.return_to_sender,
        previousStatus: routing.status,
        newStatus: MailRoutingStatus.returned,
        note: dto.note,
      },
    });

    return updatedRouting;
  }

  /**
   * Complete routing and optionally archive the document
   */
  async complete(routingId: string, currentUserId: string, dto: CompleteRoutingDto) {
    const routing = await this.prisma.mailRouting.findUnique({
      where: { id: routingId },
      include: { participants: true },
    });

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    const isInitiator = routing.initiatedById === currentUserId;
    const isAssignee = routing.currentAssigneeId === currentUserId;

    if (!isInitiator && !isAssignee) {
      throw new ForbiddenException('Only the initiator or current assignee can complete a routing');
    }

    if (routing.status === MailRoutingStatus.completed) {
      throw new BadRequestException('Routing is already completed');
    }

    const updatedRouting = await this.prisma.mailRouting.update({
      where: { id: routingId },
      data: {
        status: MailRoutingStatus.completed,
        updatedAt: new Date(),
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, email: true } } } },
        document: true,
        initiatedBy: { select: { id: true, name: true, email: true } },
        currentAssignee: { select: { id: true, name: true, email: true } },
        actions: { include: { actor: { select: { id: true, name: true } }, targetUser: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
        comments: { include: { author: { select: { id: true, name: true } }, replies: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    // Archive document if requested
    if (dto.archive) {
      await this.prisma.document.update({
        where: { id: routing.documentId },
        data: { status: DocumentStatus.archived },
      });
    }

    // Log complete action
    await this.prisma.mailRoutingAction.create({
      data: {
        routingId,
        actorId: currentUserId,
        actionType: MailActionType.mark_complete,
        previousStatus: routing.status,
        newStatus: MailRoutingStatus.completed,
        note: dto.note,
      },
    });

    // Log archive action separately
    if (dto.archive) {
      await this.prisma.mailRoutingAction.create({
        data: {
          routingId,
          actorId: currentUserId,
          actionType: MailActionType.archive,
          note: 'Document archivé après traitement complet',
        },
      });
    }

    // Audit trail
    await this.prisma.mailAuditTrail.create({
      data: {
        routingId,
        actorId: currentUserId,
        action: 'ROUTING_COMPLETED',
        newValues: JSON.stringify({
          status: MailRoutingStatus.completed,
          archived: dto.archive ?? false,
        }),
      },
    });

    const actor = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    await this.activityLog.log({
      action: dto.archive ? 'MAIL_COMPLETED_AND_ARCHIVED' : 'MAIL_COMPLETED',
      entity: 'MailRouting',
      entityId: routingId,
      entityLabel: `Routing completed`,
      userId: currentUserId,
      userName: actor?.name,
      userRole: actor?.role,
    });

    return updatedRouting;
  }

  /**
   * Add comment to routing
   */
  async addComment(routingId: string, dto: AddCommentDto, currentUserId: string) {
    const routing = await this.prisma.mailRouting.findUnique({
      where: { id: routingId },
    });

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    const comment = await this.prisma.mailComment.create({
      data: {
        documentId: routing.documentId,
        routingId,
        authorId: currentUserId,
        body: dto.body,
        parentCommentId: dto.parentCommentId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    // Log action
    await this.prisma.mailRoutingAction.create({
      data: {
        routingId,
        actorId: currentUserId,
        actionType: MailActionType.comment,
        note: `Comment: ${dto.body.substring(0, 50)}...`,
      },
    });

    return comment;
  }

  /**
   * Add participant CC/observer
   */
  async addParticipant(routingId: string, dto: AddParticipantDto, currentUserId: string) {
    const routing = await this.prisma.mailRouting.findUnique({
      where: { id: routingId },
    });

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const participant = await this.prisma.mailParticipant.upsert({
      where: {
        routingId_userId_role: {
          routingId,
          userId: dto.userId,
          role: dto.role as ParticipantRole,
        },
      },
      create: {
        routingId,
        userId: dto.userId,
        role: dto.role as ParticipantRole,
      },
      update: { joinedAt: new Date() },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Log action
    if (dto.role === 'cc') {
      await this.prisma.mailRoutingAction.create({
        data: {
          routingId,
          actorId: currentUserId,
          actionType: MailActionType.add_cc,
          targetUserId: dto.userId,
          note: `Added ${user.name} as CC`,
        },
      });
    }

    return participant;
  }

  /**
   * Get routing with full timeline
   */
  async getRoutingDetail(routingId: string, currentUserId: string) {
    const routing = await this.prisma.mailRouting.findUnique({
      where: { id: routingId },
      include: {
        document: true,
        initiatedBy: { select: { id: true, name: true, email: true } },
        currentAssignee: { select: { id: true, name: true, email: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true } } } },
        actions: { include: { actor: { select: { id: true, name: true } }, targetUser: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
        comments: { include: { author: { select: { id: true, name: true } }, replies: true }, orderBy: { createdAt: 'desc' } },
        auditTrail: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    // Check access
    const hasAccess = routing.initiatedById === currentUserId ||
      routing.currentAssigneeId === currentUserId ||
      routing.participants.some(p => p.userId === currentUserId);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this routing');
    }

    return routing;
  }

  /**
   * Get user inbox (docs to process)
   */
  async getUserInbox(currentUserId: string, status?: MailRoutingStatus) {
    const routings = await this.prisma.mailRouting.findMany({
      where: {
        OR: [
          {
            participants: {
              some: {
                userId: currentUserId,
                role: { in: [ParticipantRole.receiver, ParticipantRole.assignee] },
                completedAt: null,
              },
            },
          },
          { currentAssigneeId: currentUserId },
          { initiatedById: currentUserId },
        ],
        // If a specific status is requested, filter by it; otherwise exclude completed
        ...(status
          ? { status }
          : { status: { not: MailRoutingStatus.completed } }),
      },
      include: {
        document: true,
        participants: { include: { user: { select: { id: true, name: true } } } },
        actions: { take: 1, orderBy: { createdAt: 'desc' } },
        currentAssignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return routings;
  }

  /**
   * Get routing timeline (actions + comments combined)
   */
  async getRoutingTimeline(routingId: string, currentUserId: string) {
    const routing = await this.getRoutingDetail(routingId, currentUserId);

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    // Combine actions and comments into one timeline
    const timeline = [
      ...routing.actions.map(action => ({
        type: 'action',
        timestamp: action.createdAt,
        ...action,
      })),
      ...routing.comments.map(comment => ({
        type: 'comment',
        timestamp: comment.createdAt,
        ...comment,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return timeline;
  }

  /**
   * Validate user can perform action on routing
   */
  private async validateRoutingAccess(
    routingId: string,
    userId: string,
    action: string,
  ) {
    const routing = await this.prisma.mailRouting.findUnique({
      where: { id: routingId },
      include: { participants: true },
    });

    if (!routing) {
      throw new NotFoundException('Routing not found');
    }

    // Allow current assignee OR any receiver/assignee participant to act
    if (['forward', 'verify', 'reject', 'return'].includes(action)) {
      const isCurrentAssignee = routing.currentAssigneeId === userId;
      const isActiveParticipant = routing.participants.some(
        p => p.userId === userId &&
          (p.role === ParticipantRole.receiver || p.role === ParticipantRole.assignee) &&
          !p.completedAt,
      );
      const isInitiator = routing.initiatedById === userId;

      if (!isCurrentAssignee && !isActiveParticipant && !isInitiator) {
        throw new ForbiddenException(`Only current assignee or active participants can ${action}`);
      }
    }

    return routing;
  }
}

