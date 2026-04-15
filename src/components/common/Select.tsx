interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export default function Select({ children, ...props }: Props) {
  return <select className="select" {...props}>{children}</select>
}
