import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCloseLine,
  RiCheckLine,
} from 'react-icons/ri';
import { routingTemplateClient } from '../services/routingTemplateClient';
import type { RoutingTemplate, RoutingTemplateStep } from '../types/routing-template.types';
import { ParticipantRole } from '../types/mail-routing.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Spinner } from '../../../shared/components/atoms/Spinner';

export const RoutingTemplateManagementPage = () => {
  const [templates, setTemplates] = useState<RoutingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSteps, setFormSteps] = useState<RoutingTemplateStep[]>([
    { order: 1, role: ParticipantRole.RECEIVER },
  ]);
  const [isDefault, setIsDefault] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await routingTemplateClient.getAll();
      setTemplates(data);
    } catch {
      void Swal.fire({
        title: 'Erreur',
        text: 'Impossible de charger les templates.',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormSteps([{ order: 1, role: ParticipantRole.RECEIVER }]);
    setIsDefault(false);
    setEditingId(null);
  };

  const handleAddStep = () => {
    const newOrder = Math.max(...formSteps.map((s) => s.order), 0) + 1;
    setFormSteps([...formSteps, { order: newOrder, role: ParticipantRole.REVIEWER }]);
  };

  const handleRemoveStep = (order: number) => {
    if (formSteps.length > 1) {
      setFormSteps(formSteps.filter((s) => s.order !== order));
    }
  };

  const handleChangeStepRole = (order: number, role: ParticipantRole) => {
    setFormSteps(
      formSteps.map((s) => (s.order === order ? { ...s, role } : s))
    );
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      void Swal.fire({
        title: 'Nom requis',
        text: 'Veuillez entrer un nom pour le template.',
        icon: 'warning',
      });
      return;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await routingTemplateClient.update(editingId, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          steps: formSteps,
          isDefault,
        });
        void Swal.fire({
          title: 'Template mis à jour',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await routingTemplateClient.create({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          steps: formSteps,
          isDefault,
        });
        void Swal.fire({
          title: 'Template créé',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setShowForm(false);
      resetForm();
      await loadTemplates();
    } catch {
      void Swal.fire({
        title: 'Erreur',
        text: 'Impossible de sauvegarder le template.',
        icon: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ce template ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#BD114A',
    });
    if (!result.isConfirmed) return;

    try {
      await routingTemplateClient.delete(templateId);
      void Swal.fire({
        title: 'Supprimé !',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      await loadTemplates();
    } catch {
      void Swal.fire({
        title: 'Erreur',
        text: 'Impossible de supprimer le template.',
        icon: 'error',
      });
    }
  };

  const handleEdit = (template: RoutingTemplate) => {
    setFormName(template.name);
    setFormDescription(template.description || '');
    setFormSteps(template.steps);
    setIsDefault(template.isDefault || false);
    setEditingId(template.id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Hero Header */}
      <div className="arch-hero rounded-3xl px-8 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">📋 Templates de circuit</h1>
            <p className="mt-1 text-[#a8c8de]">Gérez les hiérarchies de traitement réutilisables</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="rounded-full">
              <RiAddLine className="h-4 w-4" /> Nouveau template
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-[#dde8f0] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-4">
            <h2 className="font-semibold text-[#1B3C53]">
              {editingId ? '✏️ Modifier le template' : '➕ Nouveau template'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#456882] hover:bg-[#edf4f8]"
            >
              <RiCloseLine className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Nom du template *</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Validation simple, Approbation multi-niveaux"
                className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Description (optionnel)</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Décrivez ce template..."
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1B3C53]">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-[#c4d4df] cursor-pointer"
                />
                Utiliser par défaut
              </label>
            </div>

            <div className="rounded-xl border border-[#c4d4df] bg-[#f4f7fa] p-4">
              <h3 className="mb-3 font-medium text-[#1B3C53]">Étapes ({formSteps.length})</h3>
              <div className="space-y-2">
                {formSteps.map((step) => (
                  <div key={step.order} className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#234C6A] text-xs font-bold text-white">
                      {step.order}
                    </span>
                    <select
                      value={step.role}
                      onChange={(e) => handleChangeStepRole(step.order, e.target.value as ParticipantRole)}
                      className="flex-1 rounded-lg border border-[#c4d4df] bg-white px-2.5 py-1.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                    >
                      <option value={ParticipantRole.RECEIVER}>Destinataire</option>
                      <option value={ParticipantRole.REVIEWER}>Réviseur</option>
                      <option value={ParticipantRole.APPROVER}>Approbateur</option>
                      <option value={ParticipantRole.CC}>Copie (CC)</option>
                      <option value={ParticipantRole.OBSERVER}>Observateur</option>
                    </select>
                    {formSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.order)}
                        className="flex h-6 w-6 items-center justify-center rounded text-[#BD114A] hover:bg-red-100"
                      >
                        <RiDeleteBinLine className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="mt-3 w-full rounded-lg border border-dashed border-[#c4d4df] bg-[#edf4f8] py-2 text-sm font-medium text-[#456882] transition hover:border-[#234C6A] hover:bg-[#dbeaf3]"
              >
                + Ajouter une étape
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => void handleSave()}
                isLoading={formLoading}
                className="flex-1 rounded-xl"
              >
                <RiCheckLine className="h-4 w-4" /> Enregistrer
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 rounded-xl"
              >
                <RiCloseLine className="h-4 w-4" /> Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#c4d4df] bg-[#edf4f8] px-8 py-12 text-center">
            <p className="font-medium text-[#456882]">Aucun template créé</p>
            <p className="mt-1 text-sm text-[#7aaac4]">Créez votre premier template de hiérarchie.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="overflow-hidden rounded-2xl border border-[#dde8f0] bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[#1B3C53]">{template.name}</h3>
                    {template.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2FA084]/10 px-2 py-0.5 text-xs font-medium text-[#2FA084]">
                        ⭐ Défaut
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="mt-1 text-sm text-[#456882]">{template.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.steps.map((step) => (
                      <span
                        key={step.order}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf4f8] px-2.5 py-1 text-xs text-[#456882]"
                      >
                        <span className="font-semibold">{step.order}.</span>
                        {step.role === ParticipantRole.RECEIVER ? 'Destinataire' :
                         step.role === ParticipantRole.REVIEWER ? 'Réviseur' :
                         step.role === ParticipantRole.APPROVER ? 'Approbateur' :
                         step.role === ParticipantRole.CC ? 'CC' : 'Observateur'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(template)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4f8] text-[#234C6A] hover:bg-[#dbeaf3] transition"
                  >
                    <RiEditLine className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(template.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#BD114A] hover:bg-red-100 transition"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


