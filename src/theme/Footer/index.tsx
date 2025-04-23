import React from 'react';
import OriginalFooter from '@theme-original/Footer';
import SocialFooterIcons from '@site/src/components/SocialFooterIcons';

export default function FooterWrapper(props) {
  return (
    <>
      <SocialFooterIcons />
      <OriginalFooter {...props} />
    </>
  );
}
