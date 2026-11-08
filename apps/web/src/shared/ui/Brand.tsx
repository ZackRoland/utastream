import styles from "./Brand.module.css"

type BrandProps = {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <span className={styles.brand} aria-label="UtaStream">
      <img
        src={compact ? "/brand/icon.svg" : "/brand/utastream-horizontal-white.svg"}
        alt=""
      />
    </span>
  )
}
