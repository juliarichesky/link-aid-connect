const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

export interface ApiUsuarioResponse {
  idUsuario: number;
  nome: string;
  email: string;
  perfil: string;
  status?: string;
}

export interface ApiLoginResponse {
  token: string;
  idUsuario: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface ApiContatoResponse {
  idContato: number;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  tipoContatoCodigo?: string;
  tipoContatoNome?: string;
  cidade?: string;
  uf?: string;
  observacao?: string;
  dataCadastro?: string;
}

export interface ApiDentistaResponse {
  idDentista: number;
  nome: string;
  cro: string;
  especialidade: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  status: string;
  dataCadastro?: string;
}

export interface ApiNotificacaoResponse {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  idTicket?: number;
  dataEvento?: string;
}

export interface ApiMensagemResponse {
  idMensagem: number;
  idTicket: number;
  idUsuario?: number;
  nomeUsuario?: string;
  tipoRemetente: string;
  mensagem: string;
  dataMensagem: string;
}

export interface ApiTicketResponse {
  idTicket: number;
  protocolo: string;
  contato?: ApiContatoResponse;
  canalCodigo?: string;
  canalNome?: string;
  statusCodigo?: string;
  statusNome?: string;
  prioridadeCodigo?: string;
  prioridadeNome?: string;
  classificacaoCodigo?: string;
  classificacaoNome?: string;
  responsavel?: ApiUsuarioResponse;
  dentistaResponsavel?: ApiDentistaResponse;
  assunto: string;
  descricao: string;
  resumoIa?: string;
  confiancaIa?: number;
  dataAbertura?: string;
  dataAtualizacao?: string;
  dataFechamento?: string;
  mensagens?: ApiMensagemResponse[];
}

export interface ApiTicketRequest {
  idContato?: number;
  nomeContato?: string;
  documentoContato?: string;
  emailContato?: string;
  telefoneContato?: string;
  tipoContatoCodigo?: string;
  cidadeContato?: string;
  ufContato?: string;
  canalCodigo: string;
  prioridadeCodigo: string;
  classificacaoCodigo?: string;
  idUsuarioResponsavel?: number;
  idDentistaResponsavel?: number;
  assunto: string;
  descricao: string;
  resumoIa?: string;
  confiancaIa?: number;
}

export type ApiTicketUpdateRequest = Partial<ApiTicketRequest> & {
  statusCodigo?: string;
};

export interface ApiDentistaRequest {
  nome: string;
  cro: string;
  especialidade: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  status?: string;
}

type RequestOptions = RequestInit & {
  token?: string | null;
  body?: BodyInit | Record<string, unknown> | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    let message = `Erro ${response.status} ao chamar a API.`;
    try {
      const errorBody = await response.json();
      message = errorBody?.message || message;
    } catch {
      // Mantem a mensagem padrao quando a resposta nao for JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const linkAidApi = {
  login: (email: string, password: string) =>
    request<ApiLoginResponse>("/auth/login", {
      method: "POST",
      body: { email, senha: password },
    }),

  me: (token: string) =>
    request<ApiUsuarioResponse>("/auth/me", { token }),

  listarTickets: (token: string) =>
    request<ApiTicketResponse[]>("/tickets?size=100", { token }),

  buscarTicket: (token: string, idTicket: string | number) =>
    request<ApiTicketResponse>(`/tickets/${idTicket}`, { token }),

  criarTicket: (token: string, body: ApiTicketRequest) =>
    request<ApiTicketResponse>("/tickets", {
      method: "POST",
      token,
      body,
    }),

  atualizarTicket: (token: string, idTicket: string | number, body: ApiTicketUpdateRequest) =>
    request<ApiTicketResponse>(`/tickets/${idTicket}`, {
      method: "PUT",
      token,
      body,
    }),

  arquivarTicket: (token: string, idTicket: string | number) =>
    request<ApiTicketResponse>(`/tickets/${idTicket}`, {
      method: "DELETE",
      token,
    }),

  adicionarMensagem: (token: string, idTicket: string | number, mensagem: string, tipoRemetente = "ATENDENTE") =>
    request<ApiMensagemResponse>(`/tickets/${idTicket}/mensagens`, {
      method: "POST",
      token,
      body: { mensagem, tipoRemetente },
    }),

  listarDentistas: (token: string) =>
    request<ApiDentistaResponse[]>("/dentistas", { token }),

  criarDentista: (token: string, body: ApiDentistaRequest) =>
    request<ApiDentistaResponse>("/dentistas", {
      method: "POST",
      token,
      body,
    }),

  atualizarDentista: (token: string, idDentista: string | number, body: ApiDentistaRequest) =>
    request<ApiDentistaResponse>(`/dentistas/${idDentista}`, {
      method: "PUT",
      token,
      body,
    }),

  listarUsuarios: (token: string) =>
    request<ApiUsuarioResponse[]>("/usuarios?ativos=true", { token }),

  listarContatos: (token: string) =>
    request<ApiContatoResponse[]>("/contatos", { token }),

  listarNotificacoes: (token: string) =>
    request<ApiNotificacaoResponse[]>("/dashboard/notificacoes", { token }),
};
