import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  InputAdornment,
  TextField,
  Chip,
  Divider,
  Button,
  IconButton,
  Skeleton,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  FilterList as FilterIcon,
  NavigateNext as NavigateNextIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Types for articles and categories
interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  imageUrl: string;
  date: string;
  readTime: string;
  isBookmarked: boolean;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const KnowledgeBase: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Mock data loading
  const loadData = useCallback(async () => {
    // In a real app, these would be API calls
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockCategories: Category[] = [
        { id: 'all', name: 'All Articles', count: 46 },
        { id: 'covid', name: 'COVID-19', count: 12 },
        { id: 'nutrition', name: 'Nutrition', count: 9 },
        { id: 'mental-health', name: 'Mental Health', count: 8 },
        { id: 'fitness', name: 'Fitness & Exercise', count: 7 },
        { id: 'chronic', name: 'Chronic Conditions', count: 6 },
        { id: 'pediatrics', name: 'Pediatric Health', count: 4 },
      ];

      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'Understanding Blood Pressure Readings',
          summary: 'Learn how to interpret your blood pressure numbers and what they mean for your overall health.',
          category: 'chronic',
          tags: ['Heart Health', 'Prevention', 'Monitoring'],
          imageUrl: 'https://source.unsplash.com/random/400x300/?healthcare',
          date: '2023-06-15',
          readTime: '5 min',
          isBookmarked: false,
        },
        {
          id: '2',
          title: 'The Impact of Sleep on Mental Health',
          summary: 'How sleep quality affects your mental wellbeing and tips for improving your sleep hygiene.',
          category: 'mental-health',
          tags: ['Sleep', 'Mental Health', 'Wellness'],
          imageUrl: 'https://source.unsplash.com/random/400x300/?sleep',
          date: '2023-05-28',
          readTime: '7 min',
          isBookmarked: true,
        },
        {
          id: '3',
          title: 'COVID-19 Vaccination Updates',
          summary: 'The latest information on COVID-19 vaccines, boosters, and recommendations.',
          category: 'covid',
          tags: ['COVID-19', 'Vaccines', 'Public Health'],
          imageUrl: 'https://source.unsplash.com/random/400x300/?vaccine',
          date: '2023-06-22',
          readTime: '6 min',
          isBookmarked: false,
        },
        {
          id: '4',
          title: 'Nutrition Basics for a Healthy Diet',
          summary: 'Essential nutrients and food groups to include in your daily diet for optimal health.',
          category: 'nutrition',
          tags: ['Diet', 'Nutrition', 'Healthy Eating'],
          imageUrl: 'https://source.unsplash.com/random/400x300/?nutrition',
          date: '2023-05-10',
          readTime: '8 min',
          isBookmarked: false,
        },
        {
          id: '5',
          title: 'Beginner\'s Guide to Strength Training',
          summary: 'How to start a strength training routine that\'s safe and effective for beginners.',
          category: 'fitness',
          tags: ['Exercise', 'Fitness', 'Strength Training'],
          imageUrl: 'https://source.unsplash.com/random/400x300/?fitness',
          date: '2023-06-05',
          readTime: '10 min',
          isBookmarked: true,
        },
        {
          id: '6',
          title: 'Childhood Vaccinations: What Parents Need to Know',
          summary: 'A comprehensive guide to childhood vaccines, schedules, and common concerns.',
          category: 'pediatrics',
          tags: ['Children', 'Vaccines', 'Preventive Care'],
          imageUrl: 'https://source.unsplash.com/random/400x300/?child',
          date: '2023-06-18',
          readTime: '9 min',
          isBookmarked: false,
        },
      ];

      // Featured articles (could be a separate API call in a real app)
      const mockFeaturedArticles = mockArticles.slice(0, 3);

      setCategories(mockCategories);
      setArticles(mockArticles);
      setFeaturedArticles(mockFeaturedArticles);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load articles'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle article bookmark toggle
  const handleBookmarkToggle = useCallback((articleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === articleId 
          ? {...article, isBookmarked: !article.isBookmarked} 
          : article
      )
    );
  }, []);

  // Handle article click
  const handleArticleClick = useCallback((articleId: string) => {
    navigate(`/resources/${articleId}`);
  }, [navigate]);

  // Handle category change
  const handleCategoryChange = useCallback((_event: React.SyntheticEvent, value: string) => {
    setActiveCategory(value);
  }, []);

  // Handle search
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    loadData();
  }, [loadData]);

  // Filter articles based on search term and active category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link color="inherit" href="/dashboard" aria-label="Go to Dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Knowledge Base</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Health Knowledge Base
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our collection of trusted health articles, guides, and resources to help you make informed decisions about your health.
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Retry
            </Button>
          }
        >
          Failed to load articles: {error.message}
        </Alert>
      )}

      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search for articles, topics, or keywords..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                'aria-label': 'Search articles'
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ mr: 2 }}
                aria-label="Filter articles"
              >
                Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={<BookmarkIcon />}
                aria-label="View saved articles"
              >
                Saved Articles
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Categories */}
      <Box sx={{ mb: 4, overflowX: 'auto' }}>
        <Tabs
          value={activeCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="article categories"
        >
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <Tab 
                key={index} 
                label={<Skeleton width={80} />} 
                value={`loading-${index}`}
                disabled
              />
            ))
          ) : (
            categories.map((category) => (
              <Tab 
                key={category.id} 
                label={`${category.name} (${category.count})`} 
                value={category.id} 
                aria-label={`Show ${category.name} articles`}
              />
            ))
          )}
        </Tabs>
      </Box>

      {/* Featured Articles */}
      {(activeCategory === 'all' || !activeCategory) && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Featured Articles
          </Typography>
          <Grid container spacing={3}>
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Grid item xs={12} md={4} key={`featured-skeleton-${index}`}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} width="80%" />
                      <Skeleton variant="text" height={20} width="40%" />
                      <Skeleton variant="text" height={80} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              featuredArticles.map((article) => (
                <Grid item xs={12} md={4} key={`featured-${article.id}`}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea 
                      onClick={() => handleArticleClick(article.id)}
                      aria-label={`Read article: ${article.title}`}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={article.imageUrl}
                        alt=""
                        aria-hidden="true"
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {article.date} • {article.readTime} read
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleBookmarkToggle(article.id, e)}
                            aria-label={article.isBookmarked ? "Remove from saved articles" : "Save article"}
                          >
                            {article.isBookmarked ? (
                              <BookmarkIcon fontSize="small" color="primary" />
                            ) : (
                              <BookmarkBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {article.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {article.summary}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {article.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      {/* All Articles */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          {activeCategory === 'all' ? 'All Articles' : categories.find(c => c.id === activeCategory)?.name || 'Articles'}
        </Typography>
        
        {isLoading ? (
          <Grid container spacing={3}>
            {Array(6).fill(0).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`article-skeleton-${index}`}>
                <Card>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" height={28} width="80%" />
                    <Skeleton variant="text" height={20} width="40%" />
                    <Skeleton variant="text" height={60} />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="rectangular" width={60} height={20} sx={{ display: 'inline-block', mr: 1 }} />
                      <Skeleton variant="rectangular" width={70} height={20} sx={{ display: 'inline-block' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredArticles.length > 0 ? (
          <Grid container spacing={3}>
            {filteredArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={`article-${article.id}`}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea 
                    onClick={() => handleArticleClick(article.id)}
                    aria-label={`Read article: ${article.title}`}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={article.imageUrl}
                      alt=""
                      aria-hidden="true"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {article.date} • {article.readTime} read
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleBookmarkToggle(article.id, e)}
                          aria-label={article.isBookmarked ? "Remove from saved articles" : "Save article"}
                        >
                          {article.isBookmarked ? (
                            <BookmarkIcon fontSize="small" color="primary" />
                          ) : (
                            <BookmarkBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {article.summary}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {article.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {article.tags.length > 2 && (
                          <Chip 
                            label={`+${article.tags.length - 2}`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>
              No articles found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters to find what you're looking for.
            </Typography>
          </Box>
        )}
        
        {/* Load More Button */}
        {filteredArticles.length > 0 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              size="large"
              aria-label="Load more articles"
            >
              Load More Articles
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default KnowledgeBase; 