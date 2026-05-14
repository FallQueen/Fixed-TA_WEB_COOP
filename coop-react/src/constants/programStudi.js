export const PROGRAM_STUDI_OPTIONS = [
  'S1 Artificial Intelligence (AI) and Robotics',
  'S1 Business Mathematics',
  'S1 Digital Business Technology',
  'S1 Food Business Technology',
  'S1 Product Design Innovation',
  'S1 Renewable Energy Engineering',
];

export const getMergedProgramStudiOptions = (...userCollections) => (
  [...new Set([
    ...PROGRAM_STUDI_OPTIONS,
    ...userCollections
      .flat()
      .map((user) => user?.program_studi)
      .filter(Boolean),
  ])]
);
