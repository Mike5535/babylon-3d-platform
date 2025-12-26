const containsTargetId = (obj: any, ids: any) => {
  if (!obj || typeof obj !== 'object') return false;

  if (Array.isArray(obj)) {
    return (obj as any[]).some((item): any => containsTargetId(item, ids));
  }

  for (const key in obj) {
    if (key === 'node_id' && ids.includes(obj[key])) {
      return true;
    }

    if (typeof obj[key] === 'object') {
      if (containsTargetId(obj[key], ids)) return true;
    }
  }

  return false;
};

export const filterWithParents = (array: any[], ids: any[]) => {
  return array.filter((item) => !containsTargetId(item, ids));
};
