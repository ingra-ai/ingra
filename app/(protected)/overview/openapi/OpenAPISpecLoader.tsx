'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Loader, FileJsonIcon } from 'lucide-react';
import Tree, { type FieldDataNode } from 'rc-tree';
import { Button } from '@components/ui/button';
import { useToast } from '@components/ui/use-toast';
import { createPathTree } from './createPathTree';

interface OpenAPISpecLoaderProps {
  openapiUrl: string;
}

export const OpenAPISpecLoader: React.FC<OpenAPISpecLoaderProps> = ( props ) => {
  const { openapiUrl } = props;
  const [spec, setSpec] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [refinedSpec, setRefinedSpec] = useState<Record<string, any> | null>(null);
  const loadTimeoutRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if ( loadTimeoutRef.current ) {
      clearTimeout( loadTimeoutRef.current );
    }

    if ( typeof window === 'undefined' ) return;

    loadTimeoutRef.current = window.setTimeout(() => {
      setLoading(true);
      fetch(openapiUrl).then( res => res.json() ).then( (data) => {
        setSpec(data);
        setRefinedSpec(data);
        setSelectedPaths(Object.keys(data.paths)); // Check all paths by default
      }).catch( (error) => {
        console.error('Error fetching OpenAPI spec:', error);
      }).finally( () => {
        setLoading(false);
      });
    }, 500);
    
    return () => {
      if ( loadTimeoutRef.current ) {
        clearTimeout( loadTimeoutRef.current );
      }
    }
  }, []);

  const onChecked = useCallback(( checkedKeys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] } ) => {
    if ( !spec ) return;

    const checkedPaths: string[] = [];

    if ( Array.isArray(checkedKeys) ) {
      checkedPaths.push(...checkedKeys as string[]);
    }
    else {
      const { checked } = checkedKeys;
      checkedPaths.push(...checked as string[]);
    }

    setSelectedPaths(checkedPaths);
    setRefinedSpec({
      ...spec,
      paths: Object.fromEntries(
        Object.entries(spec.paths).filter(([path]) =>
          checkedPaths.includes(path)
        )
      ),
    });
  }, [spec]);

  const handleCopy = useCallback(() => {
    if (refinedSpec) {
      navigator.clipboard.writeText(JSON.stringify(refinedSpec, null, 2));
      const totalPaths = Object.keys(refinedSpec?.paths)?.length || 0;
      toast({
        title: 'Copied to clipboard!',
        description: `The OpenAPI spec with ${ totalPaths } path(s) has been copied to your clipboard.`,
      });
    }
  }, [refinedSpec]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="animate-spin w-12 h-12 text-gray-500" />
        <p className="text-gray-500 text-sm">Loading spec...</p>
      </div>
    );
  }

  if (!spec) {
    return <div className="flex items-center justify-center h-screen">Failed to load spec.</div>;
  }

  const treeData = createPathTree(Object.keys(spec.paths));

  return (
    <div className="flex h-screen text-xs">
      <div className="w-[400px] p-4 overflow-y-auto border-r">
        <Tree
          checkable
          defaultExpandAll
          treeData={treeData}
          onCheck={onChecked}
          checkedKeys={selectedPaths}
          showIcon={false}
          showLine={true}
          draggable={false}
          selectable={false}
        />
      </div>
      <div className="w-full p-4 overflow-hidden overflow-y-auto overflow-x-auto">
        <div className="flex justify-end space-x-4">
          <Button
            type='button'
            variant='accent'
            className="rounded bg-transparent border"
            title="Copy OpenAPI spec to clipboard"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        <div className="block w-full overflow-y-auto overflow-x-auto">
          <pre className="p-4 rounded">
            { JSON.stringify( refinedSpec, null, 2 ) }
          </pre>
        </div>
      </div>
    </div>
  );
};

export default OpenAPISpecLoader;
