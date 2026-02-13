'use client';

import { useState, useMemo } from 'react';

const SALARIO_MINIMO = 1518;
const LIMITE_ANUAL_MEI = 81000;

const DAS_COMERCIO = 76.90;       // INSS R$75,90 + ICMS R$1,00
const DAS_SERVICO = 80.90;        // INSS R$75,90 + ISS R$5,00
const DAS_COMERCIO_SERVICO = 81.90; // INSS R$75,90 + ICMS R$1,00 + ISS R$5,00

type TipoAtividade = 'comercio' | 'servico' | 'ambos';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'percent', minimumFractionDigits: 1 });
}

export default function Home() {
  const [faturamento, setFaturamento] = useState<string>('');
  const [tipoAtividade, setTipoAtividade] = useState<TipoAtividade>('servico');

  const faturamentoNum = parseFloat(faturamento.replace(/\D/g, '')) / 100 || 0;

  const resultado = useMemo(() => {
    if (faturamentoNum <= 0) return null;

    const faturamentoAnual = faturamentoNum * 12;
    const dentroDoLimite = faturamentoAnual <= LIMITE_ANUAL_MEI;
    const percentualUsado = faturamentoAnual / LIMITE_ANUAL_MEI;

    let dasValor = DAS_SERVICO;
    if (tipoAtividade === 'comercio') dasValor = DAS_COMERCIO;
    if (tipoAtividade === 'ambos') dasValor = DAS_COMERCIO_SERVICO;

    const dasAnual = dasValor * 12;
    const cargaTributaria = (dasAnual / faturamentoAnual) * 100;

    const simplesAnexoIII = faturamentoAnual * 0.06;
    const simplesAnexoI = faturamentoAnual * 0.04;

    const irpfEstimado = faturamentoNum > 4664.68 
      ? faturamentoNum * 0.275 - 884.96 
      : faturamentoNum > 2826.65 
        ? faturamentoNum * 0.15 - 370.40
        : 0;
    const inssAutonomo = Math.min(faturamentoNum * 0.11, SALARIO_MINIMO * 0.11 * 5);

    return {
      faturamentoMensal: faturamentoNum,
      faturamentoAnual,
      dentroDoLimite,
      percentualUsado,
      dasValor,
      dasAnual,
      cargaTributaria,
      simplesAnual: tipoAtividade === 'comercio' ? simplesAnexoI : simplesAnexoIII,
      custoAutonomo: irpfEstimado + inssAutonomo,
      lucroLiquidoMEI: faturamentoNum - dasValor,
      lucroLiquidoAutonomo: faturamentoNum - irpfEstimado - inssAutonomo,
    };
  }, [faturamentoNum, tipoAtividade]);

  const handleFaturamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value) || 0;
    const formatted = (numValue / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setFaturamento(formatted);
  };

  return (
    <main className="min-h-screen bg-[#0a0f0d] text-white overflow-hidden relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzBhMGYwZCI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjMWExZjFkIj48L2NpcmNsZT4KPC9zdmc+')] opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25">
              📊
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-medium tracking-wider uppercase">Simulador Gratuito</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Calculadora <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">MEI 2026</span>
              </h1>
            </div>
          </div>
          <p className="text-white/50 text-lg max-w-xl">
            Descubra se vale a pena abrir um MEI e simule seus impostos em segundos.
          </p>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        {/* Input Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Faturamento Input */}
            <div>
              <label className="block text-white/40 text-sm font-medium mb-3 tracking-wide uppercase">
                Faturamento Mensal
              </label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 text-xl font-semibold">
                  R$
                </span>
                <input
                  type="text"
                  value={faturamento}
                  onChange={handleFaturamentoChange}
                  placeholder="0,00"
                  className="w-full pl-14 pr-6 py-5 text-3xl font-bold bg-white/5 border-2 border-white/10 rounded-2xl focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all duration-300 placeholder:text-white/20"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-amber-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl" />
              </div>
            </div>

            {/* Tipo Atividade */}
            <div>
              <label className="block text-white/40 text-sm font-medium mb-3 tracking-wide uppercase">
                Tipo de Atividade
              </label>
              <div className="space-y-2">
                {[
                  { value: 'servico', label: 'Serviços', das: DAS_SERVICO, icon: '💼' },
                  { value: 'comercio', label: 'Comércio', das: DAS_COMERCIO, icon: '🏪' },
                  { value: 'ambos', label: 'Ambos', das: DAS_COMERCIO_SERVICO, icon: '🔄' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      tipoAtividade === option.value
                        ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <input
                        type="radio"
                        name="tipoAtividade"
                        value={option.value}
                        checked={tipoAtividade === option.value}
                        onChange={(e) => setTipoAtividade(e.target.value as TipoAtividade)}
                        className="sr-only"
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-white/40 text-sm font-mono">
                      {formatCurrency(option.das)}/mês
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {resultado && (
          <>
            {/* Status Banner */}
            <div className={`relative overflow-hidden rounded-3xl p-8 mb-8 ${
              resultado.dentroDoLimite 
                ? 'bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30' 
                : 'bg-gradient-to-br from-amber-600/20 to-red-900/20 border border-amber-500/30'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative flex items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                  resultado.dentroDoLimite ? 'bg-emerald-500/30' : 'bg-amber-500/30'
                }`}>
                  {resultado.dentroDoLimite ? '✓' : '⚠'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {resultado.dentroDoLimite 
                      ? 'Você pode ser MEI!' 
                      : 'Acima do limite MEI'}
                  </h2>
                  <p className="text-white/60 mb-4">
                    {resultado.dentroDoLimite
                      ? `Usando ${formatPercent(resultado.percentualUsado)} do limite anual de R$ 81.000`
                      : 'Considere abrir uma ME no Simples Nacional'}
                  </p>
                  
                  {resultado.dentroDoLimite && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'DAS Mensal', value: formatCurrency(resultado.dasValor) },
                        { label: 'DAS Anual', value: formatCurrency(resultado.dasAnual) },
                        { label: 'Carga Tributária', value: `${resultado.cargaTributaria.toFixed(1)}%` },
                        { label: 'Lucro Líquido', value: formatCurrency(resultado.lucroLiquidoMEI) },
                      ].map((item) => (
                        <div key={item.label} className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-xl font-bold text-emerald-400">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold">Comparativo de Regimes</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-white/40 font-medium text-sm uppercase tracking-wider">Regime</th>
                      <th className="text-right py-4 px-6 text-white/40 font-medium text-sm uppercase tracking-wider">Imposto/mês</th>
                      <th className="text-right py-4 px-6 text-white/40 font-medium text-sm uppercase tracking-wider">% Fat.</th>
                      <th className="text-right py-4 px-6 text-white/40 font-medium text-sm uppercase tracking-wider">Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-emerald-500/10 border-b border-white/5">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400">★</span>
                          <span className="font-semibold">MEI</span>
                        </div>
                      </td>
                      <td className="text-right py-5 px-6 font-mono font-bold text-emerald-400">
                        {formatCurrency(resultado.dasValor)}
                      </td>
                      <td className="text-right py-5 px-6 font-mono text-emerald-400">
                        {resultado.cargaTributaria.toFixed(1)}%
                      </td>
                      <td className="text-right py-5 px-6 font-mono font-bold text-emerald-400">
                        {formatCurrency(resultado.lucroLiquidoMEI)}
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-5 px-6 font-medium">Autônomo (PF)</td>
                      <td className="text-right py-5 px-6 font-mono text-white/70">
                        {formatCurrency(resultado.custoAutonomo)}
                      </td>
                      <td className="text-right py-5 px-6 font-mono text-white/70">
                        {((resultado.custoAutonomo / resultado.faturamentoMensal) * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-5 px-6 font-mono text-white/70">
                        {formatCurrency(resultado.lucroLiquidoAutonomo)}
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-6 font-medium">Simples Nacional</td>
                      <td className="text-right py-5 px-6 font-mono text-white/70">
                        {formatCurrency(resultado.simplesAnual / 12)}
                      </td>
                      <td className="text-right py-5 px-6 font-mono text-white/70">
                        {tipoAtividade === 'comercio' ? '4-6%' : '6-15%'}
                      </td>
                      <td className="text-right py-5 px-6 font-mono text-white/70">
                        {formatCurrency(resultado.faturamentoMensal - resultado.simplesAnual / 12)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">📋</div>
                  <h4 className="font-bold text-lg">Benefícios do MEI</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    'CNPJ para emitir nota fiscal',
                    'Aposentadoria por idade',
                    'Auxílio-doença',
                    'Salário-maternidade',
                    'Conta PJ e acesso a crédito',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/70">
                      <span className="text-emerald-400 text-sm">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">⚡</div>
                  <h4 className="font-bold text-lg">Limites 2026</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    'Faturamento: até R$ 81.000/ano',
                    'Máximo 1 funcionário',
                    'Não pode ser sócio de outra empresa',
                    'Atividade na lista permitida',
                    'Profissões regulamentadas: não',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/70">
                      <span className="text-amber-400 text-sm">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!resultado && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 flex items-center justify-center text-5xl">
              💡
            </div>
            <h3 className="text-xl font-bold mb-2 text-white/70">Digite seu faturamento</h3>
            <p className="text-white/40">Veja instantaneamente se o MEI é ideal para você</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-white/10">
          <p className="text-white/30 text-sm">
            Calculadora MEI 2026 • Valores atualizados • Consulte um contador para decisões fiscais
          </p>
        </footer>
      </div>
    </main>
  );
}
