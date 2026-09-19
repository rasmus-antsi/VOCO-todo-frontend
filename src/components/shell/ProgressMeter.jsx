import styles from './ProgressMeter.module.css'

/**
 * The rail's readout. This — with the live dot — is the only place the signal
 * colour appears at any size.
 */
export default function ProgressMeter({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className={styles.meter}>
      <div className={styles.head}>
        <span className="label">Complete</span>
        <span className={`num ${styles.pct}`}>{pct}%</span>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tasks complete"
      >
        <div className={styles.fill} style={{ transform: `scaleX(${pct / 100})` }} />
      </div>

      <p className={`num ${styles.detail}`}>
        {done} of {total}
      </p>
    </div>
  )
}
