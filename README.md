# Corridas Pro — primeira versão

## O que já funciona
- Cadastro e login local.
- Dashboard.
- Agendamento de corridas.
- Lista e filtros.
- Concluir/reabrir corrida.
- Exclusão de corrida.
- Calculadora de custo e lucro.
- Configuração de GNV, manutenção e custos fixos.
- PWA instalável no celular.
- Dados persistidos no navegador via localStorage.

## Como testar
1. Abra `index.html` em um navegador moderno.
2. Crie uma conta.
3. Cadastre os custos em **Config.**
4. Agende suas corridas.
5. Use **Custos** para calcular o resultado.

## Importante
Esta primeira versão usa armazenamento local no aparelho. O login não é um sistema de autenticação em nuvem. Para produção, a próxima etapa é conectar Firebase/Supabase ou outro backend, permitindo sincronização entre aparelhos, recuperação de senha e segurança real.
