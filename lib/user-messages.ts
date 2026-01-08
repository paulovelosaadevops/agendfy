// Mensagens amigáveis para o usuário final

export const userMessages = {
  // Mensagens de sucesso
  success: {
    profileUpdated: "Perfil atualizado com sucesso!",
    serviceCreated: "Serviço criado com sucesso!",
    serviceUpdated: "Serviço atualizado com sucesso!",
    serviceDeleted: "Serviço excluído com sucesso!",
    appointmentCreated: "Agendamento criado com sucesso!",
    appointmentUpdated: "Status atualizado com sucesso!",
    businessUpdated: "Configurações salvas com sucesso!",
    subscriptionCanceled: "Assinatura cancelada. Você terá acesso até o fim do período pago.",
    passwordResetSent: "Email enviado com sucesso! Verifique sua caixa de entrada.",
  },

  // Mensagens de erro amigáveis
  error: {
    generic: "Algo deu errado. Por favor, tente novamente.",
    network: "Erro de conexão. Verifique sua internet e tente novamente.",
    loadData: "Não foi possível carregar os dados. Tente recarregar a página.",
    saveData: "Não foi possível salvar. Por favor, tente novamente.",
    authentication: "Sessão expirada. Por favor, faça login novamente.",
    permission: "Você não tem permissão para realizar esta ação.",
    validation: "Por favor, verifique os dados e tente novamente.",

    // Erros específicos
    loginInvalid: "Email ou senha incorretos. Tente novamente.",
    loginEmail: "Email inválido. Por favor, verifique.",
    emailInUse: "Este email já está cadastrado.",
    weakPassword: "Senha muito fraca. Use pelo menos 6 caracteres.",
    whatsappInvalid: "WhatsApp inválido. Use o formato: (11) 96610-7578",
    passwordMismatch: "As senhas não coincidem.",
    passwordTooShort: "A senha deve ter no mínimo 6 caracteres.",

    // Limites de plano
    servicesLimit: "Você atingiu o limite de serviços do plano Free.",
    clientsLimit: "Você atingiu o limite de clientes do plano Free.",
    appointmentsLimit: "Você atingiu o limite de agendamentos do mês no plano Free.",

    // Stripe/Pagamento
    stripeNotConfigured: "Sistema de pagamento temporariamente indisponível. Entre em contato com o suporte.",
    checkoutFailed: "Não foi possível processar o pagamento. Tente novamente em alguns instantes.",
    subscriptionNotFound: "Assinatura não encontrada.",
    cancelSubscriptionFailed: "Não foi possível cancelar a assinatura. Tente novamente.",
  },

  // Mensagens de aviso
  warning: {
    servicesNearLimit: "Atenção: você está próximo do limite de serviços.",
    clientsNearLimit: "Atenção: você está próximo do limite de clientes.",
    appointmentsNearLimit: "Atenção: você está próximo do limite de agendamentos deste mês.",
  },

  // Confirmações
  confirm: {
    deleteService: "Tem certeza que deseja excluir este serviço?",
    deleteAppointment: "Tem certeza que deseja excluir este agendamento?",
    cancelSubscription: "Tem certeza que deseja cancelar sua assinatura?",
  },

  // Informações
  info: {
    noServices: "Comece criando seu primeiro serviço para disponibilizar aos seus clientes.",
    noClients: "Seus clientes aparecerão aqui automaticamente após o primeiro agendamento.",
    noAppointments: "Nenhum agendamento encontrado para esta data.",
    upgradeForMore: "Faça upgrade para o plano Premium para continuar adicionando",
    checkoutOpening: "Abrindo página de pagamento...",
  },
}

// Função helper para transformar erros técnicos em mensagens amigáveis
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Erros de autenticação Firebase
    if (
      message.includes("auth/user-not-found") ||
      message.includes("auth/wrong-password") ||
      message.includes("invalid-credential")
    ) {
      return userMessages.error.loginInvalid
    }
    if (message.includes("auth/email-already-in-use") || message.includes("email-already-in-use")) {
      return userMessages.error.emailInUse
    }
    if (message.includes("auth/invalid-email") || message.includes("invalid-email")) {
      return userMessages.error.loginEmail
    }
    if (message.includes("auth/weak-password") || message.includes("weak-password")) {
      return userMessages.error.weakPassword
    }

    // Erros de rede
    if (message.includes("network") || message.includes("fetch")) {
      return userMessages.error.network
    }

    // Se a mensagem já é amigável (não tem código técnico), retorna ela
    if (!message.includes("error") && !message.includes("failed") && !message.includes("invalid")) {
      return error.message
    }
  }

  return userMessages.error.generic
}
