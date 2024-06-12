function getSocialMedia(link) {
  const socialMediaRegex = {
    Facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com/i,
    Twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)/i,
    // Twitter: /(?:https?:\/\/)?(?:www\.)?x\.com/i,
    Instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com/i,
    Linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com/i,
    Youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com/i,
    Spotify: /(?:https?:\/\/)?(?:www\.)?open\.spotify\.com/i,
    Medium: /(?:https?:\/\/)?(?:www\.)?medium\.com/i,
    Behance: /(?:https?:\/\/)?(?:www\.)?behance\.net/i,
    Github: /(?:https?:\/\/)?(?:www\.)?github\.com/i,
    Dribble: /(?:https?:\/\/)?(?:www\.)?dribbble\.com/i,
    Google: /(?:https?:\/\/)?(?:www\.)?(google\.com|google.co\.in)/i,
  };
  for (const [socialMedia, regex] of Object.entries(socialMediaRegex)) {
    if (link.match(regex)) {
      return socialMedia;
    }
  }
  return 'Other';
}

export default getSocialMedia;
