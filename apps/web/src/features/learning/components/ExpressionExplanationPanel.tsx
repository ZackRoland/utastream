import { useEffect, useRef } from "react"

import { Icon } from "../../../shared/ui/Icon"
import type { ExpressionExplanation } from "../model/expressionExplanation"
import styles from "./ExpressionExplanationPanel.module.css"

type ExpressionExplanationPanelProps = {
  explanation: ExpressionExplanation
  sentence: string
  translation: string
  saved: boolean
  onSave: () => void
  onClose: () => void
}

export function ExpressionExplanationPanel({
  explanation,
  sentence,
  translation,
  saved,
  onSave,
  onClose,
}: ExpressionExplanationPanelProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButton.current?.focus()

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.document.addEventListener("keydown", closeOnEscape)
    return () => window.document.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <aside
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expression-title"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <span>In this song</span>
            <h2 id="expression-title" lang="ja">{explanation.expression}</h2>
          </div>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close expression explanation"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <p className={styles.reading} lang="ja">{explanation.reading}</p>
        <p className={styles.meaning}>{explanation.meaning}</p>

        <blockquote>
          <p lang="ja">{sentence}</p>
          <span>{translation}</span>
        </blockquote>

        <section className={styles.grammar}>
          <span>A little context</span>
          <h3>{explanation.grammar.title}</h3>
          <p>{explanation.grammar.body}</p>
        </section>

        <section className={styles.vocabulary}>
          <span>Words to keep</span>
          {explanation.vocabulary.map((item) => (
            <div key={item.word}>
              <p lang="ja">{item.word}<small>{item.reading}</small></p>
              <span>{item.meaning}</span>
            </div>
          ))}
        </section>

        <footer className={styles.saveArea}>
          <button
            className={saved ? styles.savedButton : styles.saveButton}
            type="button"
            aria-disabled={saved}
            aria-label={saved ? "Expression saved" : "Save expression"}
            onClick={saved ? undefined : onSave}
          >
            <Icon name={saved ? "check" : "bookmark"} size={18} />
            {saved ? "Saved" : "Save expression"}
          </button>
          {saved && (
            <p role="status">
              <Icon name="check" size={14} />
              Saved with its song and lyric.
            </p>
          )}
        </footer>
      </div>
    </aside>
  )
}
