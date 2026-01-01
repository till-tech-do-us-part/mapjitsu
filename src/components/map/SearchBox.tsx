'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

export function SearchBox() {
  const { flyTo } = useMapStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(searchQuery) + '.json');
      url.searchParams.set('access_token', token || '');
      url.searchParams.set('types', 'poi,address,neighborhood,place');
      url.searchParams.set('limit', '5');

      const response = await fetch(url.toString());
      const data = await response.json();

      setResults(data.features || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const handleResultClick = (result: SearchResult) => {
    flyTo(result.center, 16);
    setQuery(result.place_name);
    setIsOpen(false);
    setResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="search-box"
      className="absolute top-4 left-4 z-20 w-80"
    >
      <div className="relative">
        <input
          data-testid="search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search places..."
          className="w-full px-4 py-3 bg-cyber-building/90 text-cyber-text
                     rounded-xl border border-neon-blue/30
                     focus:border-neon-blue focus:outline-none
                     placeholder:text-cyber-text/40 backdrop-blur-md
                     shadow-lg shadow-neon-blue/10"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          data-testid="search-results"
          className="mt-2 bg-cyber-building/95 rounded-xl border border-neon-blue/30
                     shadow-xl backdrop-blur-md overflow-hidden"
        >
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left text-cyber-text
                         hover:bg-neon-blue/20 transition-colors
                         border-b border-neon-blue/10 last:border-b-0"
            >
              <div className="font-medium truncate">{result.place_name.split(',')[0]}</div>
              <div className="text-xs text-cyber-text/60 truncate">
                {result.place_name.split(',').slice(1).join(',')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
