interface Props {
  tag: string
}

export default function EquationTag({ tag }: Props) {
  return <span className="equation-tag">({tag})</span>
}
