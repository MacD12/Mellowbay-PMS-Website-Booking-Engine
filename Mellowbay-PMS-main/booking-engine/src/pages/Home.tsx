import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { ServicesSection } from '../components/ServicesSection';
import { GridFeaturesSection } from '../components/GridFeaturesSection';
import { ReviewsSection } from '../components/ReviewsSection';
import { ExploreSection } from '../components/ExploreSection';
import { Slab } from '../components/Slab';
import { useModals } from '../ui/ModalContext';

export const Home: React.FC = () => {
  const { openGallery } = useModals();
  const navigate = useNavigate();

  const scrollToReviews = () =>
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <HeroSection onOpenQuiz={() => navigate('/book')} />

      <Slab>
        <main>
          <ServicesSection />
          <GridFeaturesSection onOpenReviews={scrollToReviews} onOpenGallery={openGallery} />
          <ReviewsSection />
          <ExploreSection />
        </main>
      </Slab>
    </>
  );
};
