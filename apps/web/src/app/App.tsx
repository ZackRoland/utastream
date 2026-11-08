import { Brand } from "../shared/ui/Brand"
import { Icon } from "../shared/ui/Icon"
import styles from "./App.module.css"

const foundations = [
  "Production React and Vite entrypoint",
  "Design tokens and licensed local fonts",
  "Accessible brand and icon primitives",
  "Catalog, playback, lyrics, and learning feature boundaries",
]

export function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand />
        <span className={styles.increment}>Migration increment 1</span>
      </header>

      <main className={styles.main}>
        <section className={styles.checkpoint} aria-labelledby="checkpoint-title">
          <span className={styles.eyebrow}>FOUNDATION CHECKPOINT</span>
          <h1 id="checkpoint-title">A maintainable home for the first slice.</h1>
          <p>
            The production client now has explicit boundaries. Prototype behavior
            will enter one feature at a time after this structure is reviewed.
          </p>

          <ul className={styles.list}>
            {foundations.map((foundation) => (
              <li key={foundation}>
                <Icon name="check" size={18} />
                {foundation}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
