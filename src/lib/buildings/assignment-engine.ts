import { BlueprintType } from './blueprint-registry';

interface UserData {
  id: string;
  name?: string;
  bio?: string;
  techStack?: string[];
  githubUsername?: string;
}

export function assignBuildingBlueprint(user: UserData): BlueprintType {
  // 1. Assign Educatech Campus to specific usernames/IDs
  const EDUCATECH_USERS = ['educatetech-ai', 'paulinho-educatech', 'admin'];
  if (user.githubUsername && EDUCATECH_USERS.includes(user.githubUsername.toLowerCase())) {
    return 'EDUCATECH_CAMPUS';
  }

  // 2. Assign AI Tower to AI/ML enthusiasts
  const AI_KEYWORDS = ['ai', 'ml', 'machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'openai', 'anthropic', 'data science'];
  
  const bio = user.bio?.toLowerCase() || '';
  const stack = user.techStack?.map(s => s.toLowerCase()) || [];
  
  const hasAIKeywords = AI_KEYWORDS.some(kw => 
    bio.includes(kw) || stack.some(s => s.includes(kw))
  );

  if (hasAIKeywords) {
    return 'AI_TOWER';
  }

  // 3. Fallback to generic
  return 'GENERIC';
}
