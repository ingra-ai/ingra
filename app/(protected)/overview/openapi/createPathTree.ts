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

    // Check for the specific case of "/api/v1/me"
    const rootSegment = '/api/v1/me';
    if (path.startsWith(rootSegment)) {
      const remainingSegments = segments.slice(3); // Remove "api", "v1", "me"


      // Ensure "/api/v1/me" exists in the tree
      let child = current.children.find((child) => child.key === rootSegment);
      if (!child) {
        child = {
          title: 'me',
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
