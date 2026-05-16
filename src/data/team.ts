export type TeamMember = {
  name: string
  role: string
  bio?: string
  linkedinUrl?: string
}

/**
 * Drop your group photo (all three in frame) at:
 *   Iron_Clad/public/team-photo.jpg
 * Supported: .jpg, .jpeg, .png, .webp — update the path below if needed.
 */
export const TEAM_GROUP_PHOTO = '/team-photo.jpg'

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Hasun Tisera',
    role: 'Project Lead & Systems',
    bio: 'Friends who signed up for one 24-hour buildathon and somehow shipped Iron Clad. Led the squad, wired the systems side, and kept us off the “we’ll finish it after” path.',
    linkedinUrl: 'https://www.linkedin.com/in/hasun-tisera',
  },
  {
    name: 'Subhagya Narayana',
    role: 'Backend Developer',
    bio: 'Same friend group, new challenge: build a real-time redaction backend in 24 hours. Made Convex, PDFs, and buildathon panic play nice before demo.',
    linkedinUrl: 'https://www.linkedin.com/in/subhagya-narayana',
  },
  {
    name: 'Chathura Viraj',
    role: 'Frontend Developer',
    bio: 'Teamed up with friends for the buildathon—not for brunch. Built the frontend in 24h so Iron Clad looked demo-ready when the clock hit zero.',
    linkedinUrl: 'https://www.linkedin.com/in/chathura-munasinghe',
  },
]
