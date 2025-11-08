export type UserProfile = 'Medico' | 'Secretaria' | 'Administrador' | 'Superusuario'

export type ExamStatus = 
  | 'Amostra Coletada'
  | 'Recolhido pelo Laboratório'
  | 'Resultado Liberado'
  | 'Conferido pela Secretária'
  | 'Parecer Médico Emitido'
  | 'Paciente Comunicada'
  | 'Próxima Consulta Comunicada ao Comercial'

export type CitologiaInterpretation = 
  | 'Normal'
  | 'Inconclusivo'
  | 'ASC-US'
  | 'ASC-H'
  | 'LSIL'
  | 'HSIL'
  | 'AGC'
  | 'Carcinoma'

export type DnaHpvResult = 'Nao_realizada' | 'Negativa' | 'Positiva'

export type BiopsiaInterpretation = 'Normal' | 'Alterado' | 'Nao_realizado'

export type ReturnType = 'Imediato' | '6m' | '1a' | '2a' | 'Outro'

export type ContactMethod = 'WhatsApp' | 'Telefone' | 'Email'

export interface User {
  id: string
  nome: string
  email: string
  senha_hash: string
  perfil: UserProfile
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  nome_completo: string
  data_nascimento: string
  telefone?: string
  medico_responsavel_id?: string
  created_at: string
  updated_at: string
}

export interface Lab {
  id: string
  nome: string
  pessoa_contato?: string
  telefone_contato?: string
  link_resultados?: string
  sla_dias?: number
  created_at: string
  updated_at: string
}

export interface Exam {
  id: string
  patient_id: string
  medico_id: string
  lab_id: string
  
  // Dados da coleta
  data_coleta: string
  numero_frasco: string
  citologia_realizada: boolean
  dna_hpv_solicitado: boolean
  biopsia_solicitada: boolean
  observacoes_iniciais?: string
  
  // Status e datas
  status: ExamStatus
  data_amostra_coletada: string
  data_recolhido_lab?: string
  data_resultado_liberado?: string
  data_conferido_secretaria?: string
  data_parecer_emitido?: string
  data_paciente_comunicada?: string
  data_comercial_comunicado?: string
  
  // Comunicação
  meio_contato?: ContactMethod
  proxima_consulta_comercial_comunicada: boolean
  
  // Parecer médico
  interpretacao_citologia?: CitologiaInterpretation
  dna_hpv_resultado: DnaHpvResult
  interpretacao_biopsia: BiopsiaInterpretation
  parecer_observacoes?: string
  data_proxima_consulta?: string
  tipo_retorno?: ReturnType
  
  created_at: string
  updated_at: string
  
  // Relations
  patient?: Patient
  medico?: User
  lab?: Lab
}

export interface AuditLog {
  id: string
  user_id: string
  exam_id?: string
  action: string
  old_values?: any
  new_values?: any
  justificativa?: string
  created_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  description?: string
  updated_at: string
}

export interface MessageTemplate {
  id: string
  nome: string
  conteudo: string
  tipo: string
  ativo: boolean
  created_at: string
  updated_at: string
}