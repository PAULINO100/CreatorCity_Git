/**
 * Phase 21G-SMARTSEARCH — Atlas City District Search Mapping
 * Maps search terms and synonyms to specific districts / buildings.
 * Priority 1-10 (10 = highest relevance).
 */

export type DistrictId =
  | 'Tecnologia'
  | 'Saúde'
  | 'Engenharia'
  | 'Direito'
  | 'Educação'
  | 'Negócios'
  | 'Construção'
  | 'Agro'
  | 'Arte'
  | 'Ciência';

export type ConnectionType = 'same-district' | 'cross-district' | 'related';

export interface SearchMapping {
  term: string;
  synonyms: string[];
  targetDistrict: DistrictId;
  targetBuildingName?: string; // partial match against building "nome"
  targetSpecialty?: string;    // partial match against building "especialidades"
  connectionType: ConnectionType;
  priority: number;
  crossDistrictNote?: string; // Message shown for cross-district redirects
}

// Normalisation helper (accent-insensitive, lowercase)
export function normalizeTerm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const DISTRICT_SEARCH_MAPPINGS: SearchMapping[] = [
  // ═══════════════════════════════════
  // SAÚDE
  // ═══════════════════════════════════
  {
    term: 'clínico geral',
    synonyms: ['medico', 'consulta', 'clinica', 'saude basica', 'clinico'],
    targetDistrict: 'Saúde',
    targetSpecialty: 'Medicina',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'fisioterapia',
    synonyms: ['fisio', 'reabilitacao', 'fisioterapeuta'],
    targetDistrict: 'Saúde',
    targetSpecialty: 'Fisioterapia',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'psicologia',
    synonyms: ['psicologo', 'psicologa', 'saude mental', 'terapia'],
    targetDistrict: 'Saúde',
    targetSpecialty: 'Psicologia',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'nutricao',
    synonyms: ['nutricionista', 'dieta', 'alimentacao', 'nutrologia'],
    targetDistrict: 'Saúde',
    targetSpecialty: 'Nutrição',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'odontologia',
    synonyms: ['dentista', 'dente', 'ortodontia', 'dental'],
    targetDistrict: 'Saúde',
    targetSpecialty: 'Odontologia',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'enfermagem',
    synonyms: ['enfermeiro', 'enfermeira', 'hospital', 'uti'],
    targetDistrict: 'Saúde',
    targetSpecialty: 'Enfermagem',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'engenharia biomedica',
    synonyms: ['biomedica', 'equipamentos medicos'],
    targetDistrict: 'Engenharia',
    crossDistrictNote: 'Saúde ↔ Engenharia Biomédica',
    connectionType: 'cross-district',
    priority: 8,
  },

  // ═══════════════════════════════════
  // TECNOLOGIA
  // ═══════════════════════════════════
  {
    term: 'inteligencia artificial',
    synonyms: ['ia', 'ai', 'machine learning', 'ml', 'deep learning', 'redes neurais'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Inteligência Artificial',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'programacao',
    synonyms: ['codigo', 'dev', 'developer', 'coding', 'python', 'javascript', 'java'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Desenvolvimento',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'ciberseguranca',
    synonyms: ['seguranca digital', 'hacker', 'pentest', 'cybersecurity'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Cibersegurança',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'cloud',
    synonyms: ['nuvem', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Cloud',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'dados',
    synonyms: ['data science', 'analise de dados', 'big data', 'bi', 'dashboard'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Dados',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'mobile',
    synonyms: ['android', 'ios', 'react native', 'flutter', 'app'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Mobile',
    connectionType: 'same-district',
    priority: 8,
  },
  {
    term: 'website',
    synonyms: ['site', 'pagina web', 'frontend', 'html', 'css', 'web'],
    targetDistrict: 'Tecnologia',
    targetSpecialty: 'Web',
    connectionType: 'same-district',
    priority: 8,
  },

  // ═══════════════════════════════════
  // ENGENHARIA
  // ═══════════════════════════════════
  {
    term: 'engenharia civil',
    synonyms: ['civil', 'estrutural', 'construção civil', 'concreto'],
    targetDistrict: 'Engenharia',
    targetSpecialty: 'Engenharia Civil',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'engenharia mecanica',
    synonyms: ['mecanica', 'mecanico', 'motores', 'maquinas'],
    targetDistrict: 'Engenharia',
    targetSpecialty: 'Engenharia Mecânica',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'engenharia eletrica',
    synonyms: ['eletrica', 'eletrico', 'eletrotecnica', 'circuito'],
    targetDistrict: 'Engenharia',
    targetSpecialty: 'Engenharia Elétrica',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'engenharia quimica',
    synonyms: ['quimica', 'quimico', 'processos quimicos', 'petroleo'],
    targetDistrict: 'Engenharia',
    targetSpecialty: 'Engenharia Química',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'automacao',
    synonyms: ['robotica', 'plc', 'scada', 'controle industrial'],
    targetDistrict: 'Engenharia',
    targetSpecialty: 'Automação',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'software',
    synonyms: ['programacao', 'dev', 'codigo'],
    targetDistrict: 'Tecnologia',
    crossDistrictNote: 'Engenharia ↔ Tecnologia (Software)',
    connectionType: 'cross-district',
    priority: 8,
  },

  // ═══════════════════════════════════
  // DIREITO
  // ═══════════════════════════════════
  {
    term: 'direito trabalhista',
    synonyms: ['trabalhista', 'emprego', 'clt', 'rescisao', 'demissao'],
    targetDistrict: 'Direito',
    targetSpecialty: 'Trabalhista',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'direito tributario',
    synonyms: ['tributario', 'imposto', 'tax', 'fiscal', 'nfe', 'ir'],
    targetDistrict: 'Direito',
    targetSpecialty: 'Tributário',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'direito civil',
    synonyms: ['civil', 'contrato', 'familia', 'heranca', 'inventario'],
    targetDistrict: 'Direito',
    targetSpecialty: 'Civil',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'advogado',
    synonyms: ['advogada', 'jurista', 'juridico', 'processos'],
    targetDistrict: 'Direito',
    connectionType: 'same-district',
    priority: 9,
  },

  // ═══════════════════════════════════
  // EDUCAÇÃO
  // ═══════════════════════════════════
  {
    term: 'matematica',
    synonyms: ['mat', 'calculo', 'algebra', 'geometria', 'estatistica'],
    targetDistrict: 'Educação',
    targetSpecialty: 'Matemática',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'idioma',
    synonyms: ['ingles', 'espanhol', 'frances', 'lingua', 'traducao'],
    targetDistrict: 'Educação',
    targetSpecialty: 'Idiomas',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'concurso',
    synonyms: ['concurso publico', 'enem', 'vestibular', 'oab', 'residencia'],
    targetDistrict: 'Educação',
    targetSpecialty: 'Concursos',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'curso',
    synonyms: ['aula', 'treinamento', 'ensino', 'aprendizado'],
    targetDistrict: 'Educação',
    connectionType: 'same-district',
    priority: 8,
  },

  // ═══════════════════════════════════
  // NEGÓCIOS
  // ═══════════════════════════════════
  {
    term: 'contabilidade',
    synonyms: ['contador', 'balancete', 'nota fiscal', 'irpj', 'folha'],
    targetDistrict: 'Negócios',
    targetSpecialty: 'Contabilidade',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'mei',
    synonyms: ['microempreendedor', 'cnpj', 'simples nacional', 'abertura empresa'],
    targetDistrict: 'Negócios',
    targetSpecialty: 'MEI',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'marketing',
    synonyms: ['redes sociais', 'instagram', 'tiktok', 'anuncio', 'ads'],
    targetDistrict: 'Negócios',
    targetSpecialty: 'Marketing',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'rh',
    synonyms: ['recursos humanos', 'recrutamento', 'selecao', 'gestao de pessoas'],
    targetDistrict: 'Negócios',
    targetSpecialty: 'RH',
    connectionType: 'same-district',
    priority: 9,
  },

  // ═══════════════════════════════════
  // CONSTRUÇÃO
  // ═══════════════════════════════════
  {
    term: 'reforma',
    synonyms: ['obra', 'reformar', 'construir', 'construcao', 'pedreiro'],
    targetDistrict: 'Construção',
    targetSpecialty: 'Reforma',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'eletrica predial',
    synonyms: ['eletrica', 'instalacao eletrica', 'eletricista'],
    targetDistrict: 'Construção',
    targetSpecialty: 'Elétrica',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'hidraulica',
    synonyms: ['encanamento', 'encanador', 'tubulacao', 'agua'],
    targetDistrict: 'Construção',
    targetSpecialty: 'Hidráulica',
    connectionType: 'same-district',
    priority: 9,
  },

  // ═══════════════════════════════════
  // AGRO
  // ═══════════════════════════════════
  {
    term: 'solo',
    synonyms: ['terra', 'adubo', 'calcario', 'fertilizante', 'agricultura'],
    targetDistrict: 'Agro',
    targetSpecialty: 'Solo',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'irrigacao',
    synonyms: ['irrigar', 'gotejamento', 'aspersao', 'agua'],
    targetDistrict: 'Agro',
    targetSpecialty: 'Irrigação',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'pecuaria',
    synonyms: ['gado', 'boi', 'vaca', 'suino', 'aves', 'criacao'],
    targetDistrict: 'Agro',
    targetSpecialty: 'Pecuária',
    connectionType: 'same-district',
    priority: 9,
  },

  // ═══════════════════════════════════
  // ARTE
  // ═══════════════════════════════════
  {
    term: 'design grafico',
    synonyms: ['designer', 'visual', 'identidade visual', 'logo', 'branding'],
    targetDistrict: 'Arte',
    targetSpecialty: 'Design',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'fotografia',
    synonyms: ['fotografo', 'foto', 'edicao de foto', 'lightroom'],
    targetDistrict: 'Arte',
    targetSpecialty: 'Fotografia',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'musica',
    synonyms: ['musico', 'producao musical', 'composicao', 'audio', 'midi'],
    targetDistrict: 'Arte',
    targetSpecialty: 'Música',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'video',
    synonyms: ['edicao de video', 'videmaker', 'youtube', 'after effects', 'premiere'],
    targetDistrict: 'Arte',
    targetSpecialty: 'Vídeo',
    connectionType: 'same-district',
    priority: 9,
  },
  {
    term: 'escrita criativa',
    synonyms: ['redacao', 'copywriting', 'blog', 'conteudo'],
    targetDistrict: 'Arte',
    targetSpecialty: 'Escrita',
    connectionType: 'same-district',
    priority: 8,
  },
  {
    term: 'ui ux',
    synonyms: ['ui', 'ux', 'experiencia do usuario', 'interface', 'figma'],
    targetDistrict: 'Arte',
    targetSpecialty: 'Design',
    crossDistrictNote: 'Arte ↔ Tecnologia (UI/UX)',
    connectionType: 'related',
    priority: 9,
  },

  // ═══════════════════════════════════
  // CIÊNCIA
  // ═══════════════════════════════════
  {
    term: 'fisica',
    synonyms: ['termodinamica', 'mecanica classica', 'quantica', 'optica'],
    targetDistrict: 'Ciência',
    targetSpecialty: 'Física',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'quimica',
    synonyms: ['reacao quimica', 'organica', 'inorganica', 'bioquimica'],
    targetDistrict: 'Ciência',
    targetSpecialty: 'Química',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'biologia',
    synonyms: ['biotecnologia', 'genetica', 'celula', 'ecologia', 'microbiologia'],
    targetDistrict: 'Ciência',
    targetSpecialty: 'Biologia',
    connectionType: 'same-district',
    priority: 10,
  },
  {
    term: 'tcc',
    synonyms: ['monografia', 'dissertacao', 'metodologia cientifica', 'artigo'],
    targetDistrict: 'Ciência',
    targetSpecialty: 'Metodologia',
    connectionType: 'same-district',
    priority: 9,
  },
];

/**
 * Find the best search mapping match for a given search term.
 * Returns the highest-priority match or null.
 */
export function findSearchMatch(rawTerm: string): SearchMapping | null {
  const norm = normalizeTerm(rawTerm);
  if (norm.length < 3) return null;

  let best: SearchMapping | null = null;
  let bestScore = 0;

  for (const mapping of DISTRICT_SEARCH_MAPPINGS) {
    const mappingNorm = normalizeTerm(mapping.term);
    let score = 0;

    // Exact match on primary term
    if (norm === mappingNorm) {
      score = mapping.priority * 10 + 5;
    }
    // Partial match on primary term
    else if (norm.includes(mappingNorm) || mappingNorm.includes(norm)) {
      score = mapping.priority * 5;
    }
    // Synonym match
    else {
      for (const synonym of mapping.synonyms) {
        const synNorm = normalizeTerm(synonym);
        if (norm === synNorm) {
          score = mapping.priority * 8;
          break;
        } else if (norm.includes(synNorm) || synNorm.includes(norm)) {
          score = mapping.priority * 3;
          break;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = mapping;
    }
  }

  return bestScore > 0 ? best : null;
}
