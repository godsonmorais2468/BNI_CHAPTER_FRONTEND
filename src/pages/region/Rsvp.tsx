import { useState } from 'react'
import type { FormEvent } from 'react'
import { CircleDot, ListChecks, Lock, LockOpen, Plus, SquareCheck, Trash2, Users, X } from 'lucide-react'
import PollResults from '../../components/PollResults'
import { Field, FieldGroup, Icon3D, PageHead, Sheet, StatStrip } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { fmtDate } from '../../lib/format'
import { tally } from '../../lib/polls'
import { createPoll, deletePoll, setPollClosed, useDB } from '../../lib/store'
import { useToast } from '../../lib/toast'
import type { Poll } from '../../lib/types'

const MAX_OPTIONS = 10

export default function Rsvp() {
  const { region } = useAuth()
  const db = useDB()
  const toast = useToast()

  const [chapterId, setChapterId] = useState('')
  const [question, setQuestion] = useState('')
  const [multiple, setMultiple] = useState(false)
  const [options, setOptions] = useState(['', ''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openWho, setOpenWho] = useState<string[]>([])

  if (!region) return null
  const chapters = db.chapters.filter((c) => c.regionId === region.id)
  const polls = db.polls.filter((p) => p.regionId === region.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const answers = db.votes.filter((v) => polls.some((p) => p.id === v.pollId)).length

  const setOption = (i: number, text: string) => setOptions((o) => o.map((x, k) => (k === i ? text : x)))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!region) return
    const next: Record<string, string> = {}
    const texts = options.map((o) => o.trim()).filter(Boolean)
    if (!chapterId) next.chapterId = 'Select a chapter.'
    if (!question.trim()) next.question = 'Enter the poll name or question.'
    if (texts.length < 2) next.options = 'Add at least two answer options.'
    else if (new Set(texts.map((t) => t.toLowerCase())).size !== texts.length) next.options = 'Each option must be different.'
    setErrors(next)
    if (Object.keys(next).length) return

    createPoll({ regionId: region.id, chapterId, question, multiple, options: texts })
    toast('Poll created')
    setQuestion('')
    setOptions(['', ''])
  }

  function toggleWho(id: string) {
    setOpenWho((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  return (
    <div className="page">
      <PageHead
        eyebrow={`Region Admin · ${region.name}`}
        icon={ListChecks}
        tone="green"
        title="RSVP"
        subtitle="Ask your chapters a question. Choose radio buttons for one answer, or checkboxes when members can pick several."
      />

      <StatStrip
        items={[
          { icon: ListChecks, tone: 'green', label: 'Polls', value: polls.length },
          { icon: LockOpen, tone: 'gold', label: 'Open', value: polls.filter((p) => !p.closed).length },
          { icon: Users, tone: 'red', label: 'Responses', value: answers },
        ]}
      />

      <div className="duo">
        <Sheet icon={Plus} tone="green" title="Create poll" note={region.name}>
          <form className="form-stack" onSubmit={submit} noValidate>
            <Field label="Chapter" required error={errors.chapterId}>
              <select className="field__control native-select" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
                <option value="">Select chapter</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Poll name or question" required error={errors.question}>
              <input className="field__control" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Will you attend the Annual Day?" />
            </Field>

            <FieldGroup label="Answer type" required>
              <div className="kind">
                <button type="button" className={`kind__opt ${!multiple ? 'is-on' : ''}`} aria-pressed={!multiple} onClick={() => setMultiple(false)}>
                  <CircleDot size={20} />
                  <span>
                    <b>Radio button</b>
                    <small>Members choose any one</small>
                  </span>
                </button>
                <button type="button" className={`kind__opt ${multiple ? 'is-on' : ''}`} aria-pressed={multiple} onClick={() => setMultiple(true)}>
                  <SquareCheck size={20} />
                  <span>
                    <b>Checkbox</b>
                    <small>Members choose several</small>
                  </span>
                </button>
              </div>
            </FieldGroup>

            <FieldGroup label="Answer options" required error={errors.options}>
              <ul className="optlist">
                {options.map((text, i) => (
                  <li key={i}>
                    <span className={`optlist__mark ${multiple ? 'is-box' : ''}`} aria-hidden />
                    <input className="field__control" value={text} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} aria-label={`Option ${i + 1}`} />
                    <button type="button" className="iconbtn" disabled={options.length <= 2} onClick={() => setOptions((o) => o.filter((_, k) => k !== i))} aria-label={`Remove option ${i + 1}`}>
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <div>
                <button type="button" className="btn btn--line btn--sm" disabled={options.length >= MAX_OPTIONS} onClick={() => setOptions((o) => [...o, ''])}>
                  <Plus size={15} /> Add option
                </button>
              </div>
            </FieldGroup>

            <div>
              <button className="btn btn--primary" type="submit">
                <Plus size={16} /> Publish poll
              </button>
            </div>
          </form>
        </Sheet>

        <div className="list">
          <h2 className="list__title">
            All polls <span>{polls.length}</span>
          </h2>
          {polls.length === 0 ? (
            <div className="empty">
              <b>No polls yet.</b>
              Create the first one and members will see it in their RSVP page.
            </div>
          ) : (
            polls.map((p) => (
              <PollCard
                key={p.id}
                poll={p}
                chapterName={db.chapters.find((c) => c.id === p.chapterId)?.name ?? 'Chapter'}
                total={db.members.filter((m) => m.chapterId === p.chapterId).length}
                who={openWho.includes(p.id)}
                onWho={() => toggleWho(p.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PollCard({ poll, chapterName, total, who, onWho }: { poll: Poll; chapterName: string; total: number; who: boolean; onWho: () => void }) {
  const db = useDB()
  const toast = useToast()
  const { voters } = tally(poll, db.votes)
  return (
    <article className="pcard">
      <header className="pcard__head">
        <Icon3D icon={poll.multiple ? SquareCheck : CircleDot} tone={poll.closed ? 'steel' : 'green'} size={46} />
        <div className="pcard__title">
          <b>{poll.question}</b>
          <span>
            {chapterName} · created {fmtDate(poll.createdAt)}
          </span>
        </div>
        <div className="chips">
          <span className="chip">{poll.multiple ? 'Checkbox' : 'Radio button'}</span>
          <span className={`stat ${poll.closed ? 'stat--idle' : 'stat--ok'}`}>{poll.closed ? 'Closed' : 'Open'}</span>
        </div>
      </header>

      <PollResults poll={poll} votes={db.votes} members={who ? db.members : undefined} />

      <footer className="pcard__foot">
        <span className="pcard__count">
          <Users size={15} /> {voters} of {total} responded
        </span>
        <div className="pcard__acts">
          <button className="btn btn--line btn--sm" onClick={onWho} aria-expanded={who}>
            {who ? 'Hide responses' : 'View responses'}
          </button>
          <button
            className="btn btn--line btn--sm"
            onClick={() => {
              setPollClosed(poll.id, !poll.closed)
              toast(poll.closed ? 'Poll reopened' : 'Poll closed')
            }}
          >
            {poll.closed ? (
              <>
                <LockOpen size={14} /> Reopen
              </>
            ) : (
              <>
                <Lock size={14} /> Close poll
              </>
            )}
          </button>
          <button
            className="iconbtn"
            aria-label="Delete poll"
            onClick={() => {
              deletePoll(poll.id)
              toast('Poll deleted')
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </footer>
    </article>
  )
}
