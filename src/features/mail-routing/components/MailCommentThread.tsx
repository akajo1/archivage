import React, { useState } from 'react';
import type { MailComment } from '../types/mail-routing.types';
import { useAddComment } from '../hooks/useMailRouting';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';

interface MailCommentThreadProps {
  comments: MailComment[];
  routingId: string;
  onCommentAdded?: (comment: MailComment) => void;
}

/**
 * Thread de commentaires avec réponses
 */
export const MailCommentThread: React.FC<MailCommentThreadProps> = ({
  comments,
  routingId,
  onCommentAdded,
}) => {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const { addComment, loading } = useAddComment();

  const handleSubmitComment = async () => {
    if (!commentBody.trim()) return;

    const result = await addComment(routingId, commentBody, replyTo || undefined);
    if (result) {
      setCommentBody('');
      setReplyTo(null);
      onCommentAdded?.(result);
    }
  };

  const renderComment = (comment: MailComment, level = 0) => {
    return (
      <div key={comment.id} style={{ marginLeft: `${level * 20}px` }} className="mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">{comment.author.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-gray-700 text-sm mb-2">{comment.body}</p>
          <button
            onClick={() => setReplyTo(comment.id)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Répondre
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}

        {/* Reply form */}
        {replyTo === comment.id && (
          <div className="mt-2 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-gray-600 mb-2">Répondre à {comment.author.name}</p>
            <div className="space-y-2">
              <Input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Votre réponse..."
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitComment}
                  isLoading={loading}
                  className="text-sm"
                >
                  Envoyer
                </Button>
                <Button
                  onClick={() => {
                    setReplyTo(null);
                    setCommentBody('');
                  }}
                  variant="secondary"
                  className="text-sm"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Commentaires ({comments.length})</h3>

      {/* Root comments */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Add new comment form */}
      {!replyTo && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">Ajouter un commentaire</p>
          <div className="space-y-2">
            <Input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Votre commentaire..."
              className="w-full"
            />
            <Button
              onClick={handleSubmitComment}
              isLoading={loading}
              className="text-sm"
            >
              Commenter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

