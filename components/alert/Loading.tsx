import { FC } from 'react'
import styles from './Loading.module.css'

interface LoadingProps {
  text?: string
  subtext?: string
}

const Loading: FC<LoadingProps> = ({ text = 'Loading...', subtext }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className="text-center">
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{text}</p>
        {subtext && <p className={styles.loadingSubtext}>{subtext}</p>}
      </div>
    </div>
  )
}

export default Loading 