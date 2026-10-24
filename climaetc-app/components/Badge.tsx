interface BadgeProps {
  letra: string
  ativo?: boolean
}

export function Badge({ letra, ativo }: Readonly<BadgeProps>) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${ativo ? 'bg-[#04463e] text-white' : 'bg-[#d9eee8] text-[#0b5c52]'}`}
    >
      {letra}
    </span>
  )
}
