interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
}

export default function IconButton({ icon, label, ...props }: Props) {
  return (
    <button className="icon-btn" aria-label={label} title={label} {...props}>
      {icon}
    </button>
  )
}
