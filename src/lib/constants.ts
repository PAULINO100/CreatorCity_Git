export interface NeighborhoodCluster {
  id: string;
  nome: string;
  cor: string;
  cor_hex: string;
  posicao: { x: number; y: number };
  totalPredios: number;
  totalAgentes: number;
  icone: string;
}

export interface MacroBuilding {
  id: string;
  nome: string;
  bairro: string;
  cor: string;
  cor_hex: string;
  posicao: { x: number; y: number };
  icone: string;
  descricao: string;
  totalPredios: number;
  totalAgentes: number;
}

export const NEIGHBORHOOD_CLUSTERS: NeighborhoodCluster[] = [
  { id: 'tecnologia', nome: 'Tecnologia', cor: 'blue', cor_hex: '#3B82F6', posicao: { x: 1000, y: 200 }, totalPredios: 40, totalAgentes: 40380, icone: '💻' },
  { id: 'engenharia', nome: 'Engenharia', cor: 'red', cor_hex: '#EF4444', posicao: { x: 1400, y: 400 }, totalPredios: 35, totalAgentes: 35420, icone: '⚙️' },
  { id: 'saude', nome: 'Saúde', cor: 'green', cor_hex: '#10B981', posicao: { x: 1500, y: 700 }, totalPredios: 30, totalAgentes: 30150, icone: '🏥' },
  { id: 'direito', nome: 'Direito', cor: 'purple', cor_hex: '#8B5CF6', posicao: { x: 400, y: 700 }, totalPredios: 20, totalAgentes: 20890, icone: '⚖️' },
  { id: 'educacao', nome: 'Educação', cor: 'amber', cor_hex: '#F59E0B', posicao: { x: 500, y: 300 }, totalPredios: 25, totalAgentes: 25670, icone: '📚' },
  { id: 'negocios', nome: 'Negócios', cor: 'cyan', cor_hex: '#06B6D4', posicao: { x: 1000, y: 600 }, totalPredios: 30, totalAgentes: 30240, icone: '💼' },
  { id: 'construcao', nome: 'Construção', cor: 'brown', cor_hex: '#92400E', posicao: { x: 1000, y: 1100 }, totalPredios: 20, totalAgentes: 20180, icone: '🏗️' },
  { id: 'agro', nome: 'Agro', cor: 'lime', cor_hex: '#84CC16', posicao: { x: 300, y: 1200 }, totalPredios: 15, totalAgentes: 15420, icone: '🌾' },
  { id: 'arte', nome: 'Arte', cor: 'pink', cor_hex: '#EC4899', posicao: { x: 400, y: 900 }, totalPredios: 15, totalAgentes: 15280, icone: '🎨' },
  { id: 'ciencia', nome: 'Ciência', cor: 'indigo', cor_hex: '#6366F1', posicao: { x: 1500, y: 1200 }, totalPredios: 20, totalAgentes: 20690, icone: '🔬' }
];

export const MACRO_VIEW_BUILDINGS: MacroBuilding[] = [
  {
    id: 'macro_saude',
    nome: 'Saúde',
    bairro: 'Saúde',
    cor: 'green',
    cor_hex: '#10B981',
    posicao: { x: 400, y: 1200 },
    icone: '🏥',
    descricao: 'Diagnóstico, exames, urgência, nutrição, fisioterapia',
    totalPredios: 25,
    totalAgentes: 30150
  },
  {
    id: 'macro_direito',
    nome: 'Direito',
    bairro: 'Direito',
    cor: 'purple',
    cor_hex: '#8B5CF6',
    posicao: { x: 1200, y: 1200 },
    icone: '⚖️',
    descricao: 'Trabalhista, tributário, família, penal, imobiliário',
    totalPredios: 20,
    totalAgentes: 20890
  },
  {
    id: 'macro_tecnologia',
    nome: 'Tecnologia',
    bairro: 'Tecnologia',
    cor: 'blue',
    cor_hex: '#3B82F6',
    posicao: { x: 400, y: 400 },
    icone: '💻',
    descricao: 'DevOps, IA, dados, cloud, segurança, mobile',
    totalPredios: 40,
    totalAgentes: 40380
  },
  {
    id: 'macro_engenharia',
    nome: 'Engenharia',
    bairro: 'Engenharia',
    cor: 'red',
    cor_hex: '#EF4444',
    posicao: { x: 1200, y: 400 },
    icone: '⚙️',
    descricao: 'Elétrica, mecânica, civil, química, automação',
    totalPredios: 35,
    totalAgentes: 35420
  },
  {
    id: 'macro_negocios',
    nome: 'Negócios',
    bairro: 'Negócios',
    cor: 'cyan',
    cor_hex: '#06B6D4',
    posicao: { x: 1600, y: 800 },
    icone: '💼',
    descricao: 'Contabilidade, MEI, impostos, estratégia, RH',
    totalPredios: 30,
    totalAgentes: 30240
  },
  {
    id: 'macro_educacao',
    nome: 'Educação',
    bairro: 'Educação',
    cor: 'amber',
    cor_hex: '#F59E0B',
    posicao: { x: 800, y: 800 },
    icone: '📚',
    descricao: 'Matemática, física, idiomas, ENEM, concursos',
    totalPredios: 25,
    totalAgentes: 25670
  },
  {
    id: 'macro_construcao',
    nome: 'Construção',
    bairro: 'Construção',
    cor: 'brown',
    cor_hex: '#92400E',
    posicao: { x: 400, y: 1800 },
    icone: '🏗️',
    descricao: 'Estruturas, hidráulica, elétrica predial, reforma',
    totalPredios: 20,
    totalAgentes: 20180
  },
  {
    id: 'macro_agro',
    nome: 'Agro',
    bairro: 'Agro',
    cor: 'lime',
    cor_hex: '#84CC16',
    posicao: { x: 1200, y: 1800 },
    icone: '🌾',
    descricao: 'Solo, irrigação, pragas, defensivos, pecuária',
    totalPredios: 15,
    totalAgentes: 15420
  },
  {
    id: 'macro_arte',
    nome: 'Arte',
    bairro: 'Arte',
    cor: 'pink',
    cor_hex: '#EC4899',
    posicao: { x: 1800, y: 1400 },
    icone: '🎨',
    descricao: 'Design, fotografia, vídeo, música, escrita criativa',
    totalPredios: 15,
    totalAgentes: 15280
  },
  {
    id: 'macro_ciencia',
    nome: 'Ciência',
    bairro: 'Ciência',
    cor: 'indigo',
    cor_hex: '#6366F1',
    posicao: { x: 1800, y: 400 },
    icone: '🔬',
    descricao: 'Física, química, biologia, metodologia, TCC',
    totalPredios: 20,
    totalAgentes: 20690
  }
];
