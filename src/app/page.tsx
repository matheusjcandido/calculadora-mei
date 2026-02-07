'use client';

import { useState, useMemo } from 'react';

const SALARIO_MINIMO = 1518; // 2025
const LIMITE_ANUAL_MEI = 81000;
const LIMITE_MENSAL_MEI = LIMITE_ANUAL_MEI / 12;

// DAS values 2025
const DAS_COMERCIO = 75.90;
const DAS_SERVICO = 80.90;
const DAS_COMERCIO_SERVICO = 81.90;

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

    // DAS based on activity type
    let dasValor = DAS_SERVICO;
    if (tipoAtividade === 'comercio') dasValor = DAS_COMERCIO;
    if (tipoAtividade === 'ambos') dasValor = DAS_COMERCIO_SERVICO;

    const dasAnual = dasValor * 12;
    const cargaTributaria = (dasAnual / faturamentoAnual) * 100;

    // Simples Nacional comparison (rough estimate)
    const simplesAnexoIII = faturamentoAnual * 0.06; // ~6% for services
    const simplesAnexoI = faturamentoAnual * 0.04; // ~4% for commerce

    // CLT comparison
    const inssPatronal = faturamentoNum * 0.20;
    const fgts = faturamentoNum * 0.08;
    const custoCLT = faturamentoNum + inssPatronal + fgts;

    // Autonomo PF
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
      custoCLT,
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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-emerald-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🧮 Calculadora MEI 2025
          </h1>
          <p className="text-emerald-100 text-lg">
            Descubra se vale a pena abrir um MEI e quanto você vai pagar de imposto
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Calculator Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Simule seu faturamento
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faturamento mensal estimado
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="text"
                  value={faturamento}
                  onChange={handleFaturamentoChange}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Activity Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de atividade
              </label>
              <div className="space-y-2">
                {[
                  { value: 'servico', label: 'Prestação de Serviços', das: DAS_SERVICO },
                  { value: 'comercio', label: 'Comércio / Indústria', das: DAS_COMERCIO },
                  { value: 'ambos', label: 'Comércio + Serviços', das: DAS_COMERCIO_SERVICO },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      tipoAtividade === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="tipoAtividade"
                        value={option.value}
                        checked={tipoAtividade === option.value}
                        onChange={(e) => setTipoAtividade(e.target.value as TipoAtividade)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      DAS: {formatCurrency(option.das)}
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
            {/* Status Card */}
            <div className={`rounded-2xl shadow-xl p-6 mb-8 ${
              resultado.dentroDoLimite 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            } text-white`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">
                  {resultado.dentroDoLimite ? '✅' : '⚠️'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {resultado.dentroDoLimite 
                      ? 'Você pode ser MEI!' 
                      : 'Faturamento acima do limite MEI'}
                  </h3>
                  <p className="opacity-90">
                    {resultado.dentroDoLimite
                      ? `Usando ${formatPercent(resultado.percentualUsado)} do limite anual`
                      : 'Considere abrir uma ME ou EPP no Simples Nacional'}
                  </p>
                </div>
              </div>

              {resultado.dentroDoLimite && (
                <div className="bg-white/20 rounded-xl p-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-sm opacity-75">DAS Mensal</div>
                      <div className="text-xl font-bold">{formatCurrency(resultado.dasValor)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">DAS Anual</div>
                      <div className="text-xl font-bold">{formatCurrency(resultado.dasAnual)}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Carga Tributária</div>
                      <div className="text-xl font-bold">{resultado.cargaTributaria.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Lucro Líquido</div>
                      <div className="text-xl font-bold">{formatCurrency(resultado.lucroLiquidoMEI)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                📊 Comparativo de Regimes
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4">Regime</th>
                      <th className="text-right py-3 px-4">Imposto/mês</th>
                      <th className="text-right py-3 px-4">% Faturamento</th>
                      <th className="text-right py-3 px-4">Líquido/mês</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50 bg-emerald-50">
                      <td className="py-4 px-4 font-semibold text-emerald-700">
                        ⭐ MEI
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-emerald-700">
                        {formatCurrency(resultado.dasValor)}
                      </td>
                      <td className="text-right py-4 px-4 text-emerald-700">
                        {resultado.cargaTributaria.toFixed(1)}%
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-emerald-700">
                        {formatCurrency(resultado.lucroLiquidoMEI)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 px-4 font-medium">Autônomo (PF)</td>
                      <td className="text-right py-4 px-4">
                        {formatCurrency(resultado.custoAutonomo)}
                      </td>
                      <td className="text-right py-4 px-4">
                        {((resultado.custoAutonomo / resultado.faturamentoMensal) * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-4 px-4">
                        {formatCurrency(resultado.lucroLiquidoAutonomo)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 px-4 font-medium">Simples Nacional</td>
                      <td className="text-right py-4 px-4">
                        {formatCurrency(resultado.simplesAnual / 12)}
                      </td>
                      <td className="text-right py-4 px-4">
                        {tipoAtividade === 'comercio' ? '4-6%' : '6-15%'}
                      </td>
                      <td className="text-right py-4 px-4">
                        {formatCurrency(resultado.faturamentoMensal - resultado.simplesAnual / 12)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
                <strong>⚠️ Atenção:</strong> Os valores do Simples Nacional e Autônomo são estimativas. 
                Consulte um contador para valores exatos.
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span> O que o MEI inclui
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> CNPJ para emitir nota fiscal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Aposentadoria por idade (INSS)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Auxílio-doença
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Salário-maternidade
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Conta PJ e acesso a crédito
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Limites do MEI 2025
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span> Faturamento: até R$ 81.000/ano
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span> Máximo 1 funcionário
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span> Não pode ser sócio de outra empresa
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span> Atividade deve estar na lista permitida
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span> Profissões regulamentadas não podem
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            📊 Quer organizar suas finanças como MEI?
          </h3>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Tenho planilhas e templates prontos para controle financeiro, 
            emissão de recibos e gestão do seu negócio.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://curva-abc-app.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              🎯 Curva ABC Online
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Calculadora MEI © 2025 • Valores atualizados para 2025
          </p>
          <p className="mt-1">
            Esta ferramenta é informativa. Consulte um contador para decisões fiscais.
          </p>
        </footer>
      </div>
    </main>
  );
}
