// services/api/tags.ts

import { TagMotCle } from "@/types/classification";

class TagService {
  async getPopular(limit = 50): Promise<TagMotCle[]> {
    // Récupérer les tags les plus utilisés
    return fetch(`/api/tags/popular?limit=${limit}`).then(r => r.json());
  }

  async getByTypeOeuvre(typeOeuvre: string, limit = 50): Promise<TagMotCle[]> {
    // Tags associés à un type d'œuvre spécifique
    return fetch(`/api/tags/by-type/${typeOeuvre}?limit=${limit}`).then(r => r.json());
  }

  async getByCategories(categories: string[], limit = 50): Promise<TagMotCle[]> {
    // Tags associés à des catégories
    const params = new URLSearchParams();
    categories.forEach(cat => params.append('categories[]', cat));
    params.append('limit', limit.toString());
    
    return fetch(`/api/tags/by-categories?${params}`).then(r => r.json());
  }

  async getSuggestionsByContent(content: string, langue?: string, limit = 20): Promise<TagMotCle[]> {
    // Analyse IA/NLP du contenu pour suggérer des tags
    return fetch('/api/tags/analyze-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, langue, limit })
    }).then(r => r.json());
  }

  async search(query: string, options: { limit?: number; includeStats?: boolean } = {}): Promise<TagMotCle[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.includeStats) params.append('stats', 'true');
    
    return fetch(`/api/tags/search?${params}`).then(r => r.json());
  }

  async create(tagData: { nom: string; couleur?: string; suggestion?: boolean }): Promise<TagMotCle> {
    return fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tagData)
    }).then(r => r.json());
  }

  async incrementUsage(tagId: number): Promise<void> {
    await fetch(`/api/tags/${tagId}/increment-usage`, { method: 'POST' });
  }

  async getPopularByContext(context: any, limit = 20): Promise<TagMotCle[]> {
    return fetch('/api/tags/popular-by-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...context, limit })
    }).then(r => r.json());
  }
}

export const tagService = new TagService();