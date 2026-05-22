export interface CourseGroup {
  label: string;
  items: string[];
}

export const meCourseGroups: CourseGroup[] = [
  {
    label: 'Core Mechanical Engineering',
    items: [
      'Basic Mechanical Engineering',
      'Engineering Thermodynamics',
      'Applied Thermodynamics',
      'Fluid Mechanics & Hydraulics',
      'Heat Transfer',
      'Kinematics & Theory of Machines',
      'Dynamics of Machinery',
      'Fundamentals of Machine Design',
      'Design of Machine Elements',
      'Refrigeration & Air Conditioning',
      'Internal Combustion Engine',
      'Power Plant Engineering',
    ],
  },
  {
    label: 'Manufacturing & Design',
    items: [
      'Workshop / Manufacturing Practices',
      'Engineering Graphics & Design',
      'Manufacturing Processes',
      'Manufacturing Technology',
      'Computer Aided Design',
      'Computer Aided Manufacturing',
      'Mechanical Measurement & Metrology',
      'Material Science & Metallurgy',
    ],
  },
  {
    label: 'Engineering Mathematics & Science',
    items: [
      'Mathematics I',
      'Mathematics II',
      'Complex Variables & Partial Differential Equations',
      'Physics',
      'Environmental Sciences',
    ],
  },
  {
    label: 'Management, Quality & Modern Engineering',
    items: [
      'Operation Research',
      'Quality & Reliability Engineering',
      'Energy Conservation & Management',
      'Industry 4.0',
      'Nanotechnology & Surface Engineering',
      'Hydraulics & Pneumatics',
      'Organisational Behaviour',
    ],
  },
  {
    label: 'Projects / Practical',
    items: [
      'Design Engineering I-A',
      'Design Engineering I-B',
      'Design Engineering II-A',
      'Design Engineering II-B',
      'Summer Internship',
      'Internship / Project',
    ],
  },
  {
    label: 'General / Professional Development',
    items: [
      'Programming for Problem Solving',
      'English',
      'Effective Technical Communication',
      'Integrated Personality Development',
      'Indian Constitution',
      'Induction Program',
    ],
  },
];
