import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button, Card, Input, Select, Textarea } from '@lings/ui'
import { getStoredAuthToken } from '../lib/auth-client'
import BotAvatar from '../components/BotAvatar'

export const Route = createFileRoute('/bots')({ component: BotsPage })

const MODEL_TIERS = ['fast', 'balanced', 'max'] as const
type ModelTier = (typeof MODEL_TIERS)[number]

const MODEL_TIER_LABEL: Record<ModelTier, string> = {
  fast: 'Fast',
  balanced: 'Balanced',
  max: 'Max',
}

type Bot = {
  id: string
  name: string
  description: string
  systemPrompt: string
  toolsConfig: string[]
  delegationAllowlist: string[]
  avatarSeed: string
  defaultModelTier: ModelTier
}

async function api(path: string, init?: RequestInit) {
  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${getStoredAuthToken()}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
}

function csvToList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

type BotFormValue = {
  name: string
  description: string
  systemPrompt: string
  toolsConfig: string
  delegationAllowlist: string[]
  avatarSeed: string
  defaultModelTier: ModelTier
}

function emptyFormValue(): BotFormValue {
  return {
    name: '',
    description: '',
    systemPrompt: '',
    toolsConfig: '',
    delegationAllowlist: [],
    avatarSeed: crypto.randomUUID(),
    defaultModelTier: 'balanced',
  }
}

function formValueFromBot(bot: Bot): BotFormValue {
  return {
    name: bot.name,
    description: bot.description,
    systemPrompt: bot.systemPrompt,
    toolsConfig: bot.toolsConfig.join(', '),
    delegationAllowlist: bot.delegationAllowlist,
    avatarSeed: bot.avatarSeed,
    defaultModelTier: bot.defaultModelTier,
  }
}

function BotForm({
  allBots,
  editingBotId,
  initial,
  onSaved,
  onCancel,
}: {
  allBots: Bot[]
  editingBotId: string | null
  initial: BotFormValue
  onSaved: (bot: Bot) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: value.name,
      description: value.description,
      systemPrompt: value.systemPrompt,
      toolsConfig: csvToList(value.toolsConfig),
      delegationAllowlist: value.delegationAllowlist,
      avatarSeed: value.avatarSeed,
      defaultModelTier: value.defaultModelTier,
    }
    const res = editingBotId
      ? await api(`/api/bots/${editingBotId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      : await api('/api/bots', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
    if (res.ok) {
      const { bot } = await res.json()
      onSaved(bot)
    }
  }

  const delegationOptions = allBots.filter((b) => b.id !== editingBotId)

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <BotAvatar seed={value.avatarSeed} size={56} />
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setValue((v) => ({ ...v, avatarSeed: crypto.randomUUID() }))
            }
          >
            Regenerate avatar
          </Button>
        </div>

        <Input
          required
          autoFocus
          value={value.name}
          onChange={(e) => setValue((v) => ({ ...v, name: e.target.value }))}
          placeholder="Name"
        />
        <Textarea
          value={value.description}
          onChange={(e) =>
            setValue((v) => ({ ...v, description: e.target.value }))
          }
          placeholder="Description"
        />
        <Textarea
          value={value.systemPrompt}
          onChange={(e) =>
            setValue((v) => ({ ...v, systemPrompt: e.target.value }))
          }
          placeholder="System prompt"
          rows={4}
        />
        <Input
          value={value.toolsConfig}
          onChange={(e) =>
            setValue((v) => ({ ...v, toolsConfig: e.target.value }))
          }
          placeholder="Tools / MCP allowlist (comma-separated)"
        />

        <div>
          <label className="mb-1 block text-sm text-[var(--ink-soft)]">
            Delegation allowlist
          </label>
          <Select
            multiple
            value={value.delegationAllowlist}
            onChange={(e) =>
              setValue((v) => ({
                ...v,
                delegationAllowlist: Array.from(
                  e.target.selectedOptions,
                  (o) => o.value,
                ),
              }))
            }
            className="h-24 w-full"
          >
            {delegationOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>

        <Select
          value={value.defaultModelTier}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              defaultModelTier: e.target.value as ModelTier,
            }))
          }
          className="w-auto"
        >
          {MODEL_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {MODEL_TIER_LABEL[tier]}
            </option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            {editingBotId ? 'Save' : 'Create'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

function BotCard({
  bot,
  onEdit,
}: {
  bot: Bot
  onEdit: () => void
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <BotAvatar seed={bot.avatarSeed} size={48} />
        <div>
          <div className="font-semibold text-[var(--ink)]">{bot.name}</div>
          <div className="text-xs text-[var(--ink-soft)]">
            {MODEL_TIER_LABEL[bot.defaultModelTier]}
          </div>
        </div>
      </div>
      {bot.description ? (
        <p className="text-sm text-[var(--ink-soft)]">{bot.description}</p>
      ) : null}
      <Button type="button" variant="secondary" onClick={onEdit}>
        Edit
      </Button>
    </Card>
  )
}

function BotsPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [bots, setBots] = useState<Bot[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBotId, setEditingBotId] = useState<string | null>(null)
  const [formValue, setFormValue] = useState<BotFormValue>(emptyFormValue())

  useEffect(() => {
    api('/api/bots').then(async (res) => {
      if (res.status === 401) {
        navigate({ to: '/login' })
        return
      }
      const data: { bots: Bot[] } = await res.json()
      setBots(data.bots)
      setAuthed(true)
    })
  }, [navigate])

  function handleSaved(bot: Bot) {
    setBots((prev) => {
      const rest = (prev ?? []).filter((b) => b.id !== bot.id)
      return [...rest, bot]
    })
    setFormOpen(false)
    setEditingBotId(null)
  }

  function openCreateForm() {
    setEditingBotId(null)
    setFormValue(emptyFormValue())
    setFormOpen(true)
  }

  function openEditForm(bot: Bot) {
    setEditingBotId(bot.id)
    setFormValue(formValueFromBot(bot))
    setFormOpen(true)
  }

  if (!authed || !bots) {
    return (
      <main className="page-wrap px-4 py-14 text-[var(--ink-soft)]">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display-title text-2xl font-bold text-[var(--ink)]">
          Bots
        </h1>
        {!formOpen ? (
          <Button type="button" variant="primary" onClick={openCreateForm}>
            + New bot
          </Button>
        ) : null}
      </div>

      {formOpen ? (
        <BotForm
          allBots={bots}
          editingBotId={editingBotId}
          initial={formValue}
          onSaved={handleSaved}
          onCancel={() => setFormOpen(false)}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} onEdit={() => openEditForm(bot)} />
        ))}
      </div>
    </main>
  )
}
