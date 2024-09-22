interface PathNode {
  title: string;
  key: string;
  children: PathNode[];
}

export const createPathTree = (paths: string[]): PathNode[] => {
  const root: PathNode = { title: 'root', key: 'root', children: [] };

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const segments = path.split('/').filter(Boolean);
    let current = root;

    // Check for the specific case of grouping "/api/v1/me"
    const rootSegments = ['/api/v1'],
      currentPathIndex = rootSegments.findIndex((rootSegment) => path.startsWith(rootSegment));

    if (currentPathIndex >= 0) {
      const rootSegment = rootSegments[currentPathIndex];
      const remainingSegments = segments.slice(2); // Remove "api", "v1", "me/subs"

      // Ensure "/api/v1/me" exists in the tree
      let child = current.children.find((child) => child.key === rootSegment);
      if (!child) {
        // Grab the last segment as the title
        const title = rootSegment.split('/').pop() || '';

        if (!title) {
          continue;
        }

        child = {
          title,
          key: rootSegment,
          children: [],
        };
        current.children.push(child);
      }

      current = child;

      for (let j = 0; j < remainingSegments.length; j++) {
        const segment = remainingSegments[j];
        if (!current.children) {
          current.children = [];
        }
        let child = current.children.find((child) => child.title === segment);
        if (!child) {
          child = {
            title: segment,
            key: `${rootSegment}/${remainingSegments.slice(0, j + 1).join('/')}`,
            children: [],
          };
          current.children.push(child);
        }
        current = child;
      }
    } else {
      for (let j = 0; j < segments.length; j++) {
        const segment = segments[j];
        if (!current.children) {
          current.children = [];
        }
        let child = current.children.find((child) => child.title === segment);
        if (!child) {
          child = {
            title: segment,
            key: '/' + segments.slice(0, j + 1).join('/'),
            children: [],
          };
          current.children.push(child);
        }
        current = child;
      }
    }
  }

  return root.children;
};
