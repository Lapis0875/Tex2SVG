interface Props {
  text: string
  children: React.ReactNode
}

export default function Tooltip({ text, children }: Props) {
  return (
    <span className="tooltip-wrapper" title={text}>
      {children}
    </span>
  )
}
