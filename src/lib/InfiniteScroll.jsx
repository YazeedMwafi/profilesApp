import { useEffect, useRef } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

export const InfiniteScroll = ({ 
  hasMore, 
  loading, 
  loadMore, 
  children,
  threshold = 200 
}) => {
  const sentinelRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loading, loadMore, threshold]);

  return (
    <>
      {children}
      
      {/* Loading indicator */}
      {loading && (
        <Box textAlign="center" py={4}>
          <Spinner size="md" />
          <Text mt={2} fontSize="sm" color="gray.500">
            Loading more posts...
          </Text>
        </Box>
      )}
      
      {/* End of posts message */}
      {!hasMore && !loading && (
        <Box textAlign="center" py={4}>
          <Text fontSize="sm" color="gray.500">
            You've reached the end! 🎉
          </Text>
        </Box>
      )}
      
      {/* Invisible sentinel element for intersection observer */}
      <div ref={sentinelRef} style={{ height: '1px' }} />
    </>
  );
};
