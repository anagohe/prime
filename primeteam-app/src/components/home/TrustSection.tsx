const stats = [
  { label: 'Años de Experiencia', value: '+10' },
  { label: 'Contenedores Movidos', value: '5000+' },
  { label: 'Navieras Aliadas', value: '20+' },
  { label: 'Cobertura Global', value: '150+' },
]

export function TrustSection() {
  return (
    <div className="bg-slate-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-400">{stat.label}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
