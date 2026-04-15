interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ children, ...props }: Props) {
  return (
    <button className="btn" {...props}>
      {children}
    </button>
  )
}
