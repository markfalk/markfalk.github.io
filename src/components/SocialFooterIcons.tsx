import React from 'react';
import { SiGithub, SiDiscord, SiBluesky, SiLinkedin } from 'react-icons/si';

const SocialFooterIcons = () => {
  const iconSize = 24;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
      <a href="https://github.com/markfalk" target="_blank" rel="noopener noreferrer" title="GitHub">
        <SiGithub size={iconSize} />
      </a>
      <a href="https://bsky.app/profile/markfalk.com" target="_blank" rel="noopener noreferrer" title="BlueSky">
        <SiBluesky size={iconSize} />
      </a>
      {/* <a href="https://www.linkedin.com/in/markfalk1/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
        <SiLinkedin size={iconSize} />
      </a> */}
      <a href="https://discordapp.com/users/347643866091880449" target="_blank" rel="noopener noreferrer" title="Twitter">
        <SiDiscord size={iconSize} />
      </a>
    </div>
  );
};

export default SocialFooterIcons;
