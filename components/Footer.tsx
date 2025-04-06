import { FC } from "react"
import IconGithub from "./icon/IconGithub"
import NewTabLink from "./action/NewTabLink"
import IconCopyright from "./icon/IconCopyright"

interface Props {
  error?: number
}

const Footer: FC<Props> = ({ error }) => {
  return (
    <footer className={"flex flex-col bg-dark-900 py-1 px-4"}>
      {error && <div>Error {error}</div>}
    </footer>
  )
}

export default Footer
