import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Skeleton,
  Alert,
  AlertTitle,
  CircularProgress,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowIcon,
  NavigateNext as NavigateNextIcon,
  Star as StarIcon,
  Person as PersonIcon,
  LocalHospital as MedicalIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    if (error instanceof Error) {
      console.error("Error in KnowledgeBase component:", error.message, error.stack, errorInfo);
    } else if (typeof error === 'object') {
      console.error("Error in KnowledgeBase component:", JSON.stringify(error), errorInfo);
    } else {
      console.error("Error in KnowledgeBase component:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onRetry();
                }}
              >
                Retry
              </Button>
            }
          >
            <AlertTitle>Error Loading Knowledge Base</AlertTitle>
            {this.state.error?.message || (typeof this.state.error === 'object' ? JSON.stringify(this.state.error) : String(this.state.error)) || "An unexpected error occurred"}
            {this.state.error && (this.state.error as any).stack && (
              <pre style={{ whiteSpace: 'pre-wrap', color: '#888', fontSize: 12 }}>{(this.state.error as any).stack}</pre>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  bookmarked: boolean;
  popularity: number; // 1-5 stars
}

type Categories = {
  [key: string]: {
    name: string;
    count: number;
    icon: React.ReactElement;
  };
};

const KnowledgeBase: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize categories to prevent recreation on each render
  const categories: Categories = useMemo(() => ({
    'general': {
      name: 'General Health',
      count: 12,
      icon: <MedicalIcon color="primary" />
    },
    'procedures': {
      name: 'Medical Procedures',
      count: 8,
      icon: <DescriptionIcon color="primary" />
    },
    'policies': {
      name: 'Hospital Policies',
      count: 5,
      icon: <CategoryIcon color="primary" />
    },
    'insurance': {
      name: 'Insurance',
      count: 7,
      icon: <PersonIcon color="primary" />
    }
  }), []);

  // Load mock articles data
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'Understanding Your Lab Results',
          summary: 'A comprehensive guide to interpreting your laboratory test results and what different values mean for your health.',
          category: 'general',
          date: '2023-07-15',
          author: 'Dr. Sarah Johnson',
          authorRole: 'Laboratory Director',
          authorAvatar: '/assets/avatars/avatar1.jpg',
          readTime: '8 min',
          bookmarked: true,
          popularity: 5
        },
        {
          id: '2',
          title: 'Preparing for Your MRI',
          summary: 'Learn what to expect before, during, and after your magnetic resonance imaging (MRI) procedure.',
          category: 'procedures',
          date: '2023-06-22',
          author: 'Dr. Michael Chen',
          authorRole: 'Radiology Specialist',
          authorAvatar: '/assets/avatars/avatar2.jpg',
          readTime: '6 min',
          bookmarked: false,
          popularity: 4
        },
        {
          id: '3',
          title: 'Patient Rights and Responsibilities',
          summary: 'An overview of your rights as a patient and what responsibilities you have during your hospital stay.',
          category: 'policies',
          date: '2023-05-30',
          author: 'Lisa Martinez',
          authorRole: 'Patient Advocate',
          authorAvatar: '/assets/avatars/avatar3.jpg',
          readTime: '10 min',
          bookmarked: false,
          popularity: 3
        },
        {
          id: '4',
          title: 'Managing Chronic Conditions',
          summary: 'Practical advice for patients living with and managing long-term chronic health conditions.',
          category: 'general',
          date: '2023-07-05',
          author: 'Dr. James Wilson',
          authorRole: 'Internal Medicine',
          authorAvatar: '/assets/avatars/avatar4.jpg',
          readTime: '12 min',
          bookmarked: true,
          popularity: 5
        },
        {
          id: '5',
          title: 'Understanding Your Insurance Coverage',
          summary: 'Navigate the complexities of health insurance coverage, including what services are covered and how to handle claims.',
          category: 'insurance',
          date: '2023-06-10',
          author: 'Robert Taylor',
          authorRole: 'Insurance Specialist',
          authorAvatar: '/assets/avatars/avatar5.jpg',
          readTime: '9 min',
          bookmarked: false,
          popularity: 4
        },
        {
          id: '6',
          title: 'Preventive Health Screenings',
          summary: 'Recommended preventive screenings by age and risk factors to help detect health issues early.',
          category: 'general',
          date: '2023-07-18',
          author: 'Dr. Emily Brown',
          authorRole: 'Preventive Medicine',
          authorAvatar: '/assets/avatars/avatar6.jpg',
          readTime: '7 min',
          bookmarked: false,
          popularity: 4
        },
        {
          id: '7',
          title: 'What to Expect During Surgery',
          summary: 'A step-by-step guide to the surgical process, from pre-admission to recovery.',
          category: 'procedures',
          date: '2023-06-28',
          author: 'Dr. Thomas Lee',
          authorRole: 'Chief Surgeon',
          authorAvatar: '/assets/avatars/avatar7.jpg',
          readTime: '11 min',
          bookmarked: true,
          popularity: 5
        },
        {
          id: '8',
          title: 'Hospital Visitor Guidelines',
          summary: 'Information on visitor policies, hours, and protocols to ensure a safe and comfortable environment for patients.',
          category: 'policies',
          date: '2023-05-25',
          author: 'Jennifer Adams',
          authorRole: 'Hospital Administrator',
          authorAvatar: '/assets/avatars/avatar8.jpg',
          readTime: '5 min',
          bookmarked: false,
          popularity: 3
        }
      ];
      
      setArticles(mockArticles);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load articles'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Filter articles based on search term and selected category
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === null || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  // Toggle bookmark status
  const handleToggleBookmark = (id: string) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id 
          ? { ...article, bookmarked: !article.bookmarked } 
          : article
      )
    );
  };

  // Navigate to article detail view
  const handleViewArticle = (id: string) => {
    navigate(`/knowledge-base/article/${id}`);
  };

  // Format date for better accessibility
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Render popularity stars
  const renderPopularity = (popularity: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          fontSize="small" 
          color={i < popularity ? "primary" : "disabled"} 
          aria-hidden="true"
        />
      );
    }
    return (
      <Box 
        sx={{ display: 'flex', alignItems: 'center' }}
        aria-label={`${popularity} out of 5 stars`}
      >
        {stars}
      </Box>
    );
  };

  // Loading skeleton for categories
  const renderCategorySkeleton = () => (
    <Box sx={{ mb: 2 }}>
      {[1, 2, 3, 4].map((item) => (
        <Skeleton 
          key={item} 
          variant="rectangular" 
          height={60} 
          sx={{ mb: 1, borderRadius: 1 }} 
        />
      ))}
    </Box>
  );

  // Loading skeleton for articles
  const renderArticleSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} md={6} key={item}>
          <Skeleton 
            variant="rectangular" 
            height={220} 
            sx={{ borderRadius: 2, mb: 2 }} 
          />
        </Grid>
      ))}
    </>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link 
            component={RouterLink} 
            color="inherit" 
            to="/dashboard" 
            underline="hover"
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Knowledge Base</Typography>
        </Breadcrumbs>

        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={loadArticles}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Articles</AlertTitle>
          {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <ErrorBoundary onRetry={loadArticles}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs navigation */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link 
            component={RouterLink} 
            color="inherit" 
            to="/dashboard" 
            underline="hover"
          >
            Dashboard
          </Link>
          <Typography color="text.primary">Knowledge Base</Typography>
        </Breadcrumbs>

        {/* Header section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Knowledge Base
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            paragraph
          >
            Find articles, guidelines, and resources to help you better understand your health and care.
          </Typography>
        </Box>

        {/* Search and filter section */}
        <Paper
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Search articles..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end" 
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
                aria-label="Search knowledge base articles"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2">Filter by category:</Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1,
                  mt: 1
                }}
              >
                {Object.entries(categories).map(([key, category]) => (
                  <Chip
                    key={key}
                    icon={category.icon}
                    label={`${category.name} (${category.count})`}
                    onClick={() => handleCategorySelect(key)}
                    color={selectedCategory === key ? "primary" : "default"}
                    variant={selectedCategory === key ? "filled" : "outlined"}
                    sx={{ mb: 1 }}
                    clickable
                  />
                ))}
                {selectedCategory && (
                  <Chip
                    label="Clear Filters"
                    onClick={() => handleCategorySelect(null)}
                    variant="outlined"
                    onDelete={() => handleCategorySelect(null)}
                    deleteIcon={<ClearIcon />}
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Main content */}
        <Grid container spacing={4}>
          {/* Categories sidebar */}
          <Grid item xs={12} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Categories
            </Typography>
            
            {loading ? renderCategorySkeleton() : (
              <Paper
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <List disablePadding>
                  {Object.entries(categories).map(([key, category], index, array) => (
                    <React.Fragment key={key}>
                      <ListItem
                        button
                        selected={selectedCategory === key}
                        onClick={() => handleCategorySelect(key)}
                        sx={{ 
                          borderLeft: selectedCategory === key ? 
                            `4px solid ${theme.palette.primary.main}` : 
                            `4px solid transparent`
                        }}
                      >
                        <ListItemIcon>
                          {category.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={category.name} 
                          secondary={`${category.count} articles`}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: selectedCategory === key ? 600 : 400
                          }}
                        />
                      </ListItem>
                      {index < array.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}

            {/* Recent Articles */}
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Recent Articles
              </Typography>
              
              {loading ? (
                <Box>
                  {[1, 2, 3].map((item) => (
                    <Skeleton 
                      key={item} 
                      variant="rectangular" 
                      height={80} 
                      sx={{ mb: 1, borderRadius: 1 }} 
                    />
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <List disablePadding>
                    {articles
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)
                      .map((article, index, array) => (
                        <React.Fragment key={article.id}>
                          <ListItem 
                            button
                            onClick={() => handleViewArticle(article.id)}
                          >
                            <ListItemText
                              primary={article.title}
                              secondary={formatDate(article.date)}
                              primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true
                              }}
                            />
                          </ListItem>
                          {index < array.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Articles grid */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                component="h2"
                sx={{ fontWeight: 600 }}
              >
                {selectedCategory 
                  ? `${categories[selectedCategory].name} Articles` 
                  : 'All Articles'}
                {!loading && (
                  <Typography 
                    component="span" 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({filteredArticles.length} articles)
                  </Typography>
                )}
              </Typography>
            </Box>

            {loading ? (
              <Grid container spacing={3}>
                {renderArticleSkeleton()}
              </Grid>
            ) : filteredArticles.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  textAlign: 'center',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <ErrorIcon color="action" sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  No articles found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Try adjusting your search or filter to find what you're looking for.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                  }}
                  startIcon={<ClearIcon />}
                >
                  Clear Filters
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredArticles.map((article) => (
                  <Grid item xs={12} sm={6} key={article.id}>
                    <Card
                      elevation={0}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: theme.shadows[3]
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Chip 
                            size="small" 
                            label={categories[article.category].name}
                            icon={categories[article.category].icon}
                            sx={{ mb: 1 }}
                          />
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(article.id);
                            }}
                            size="small"
                            color={article.bookmarked ? "primary" : "default"}
                            aria-label={article.bookmarked ? "Remove bookmark" : "Add bookmark"}
                          >
                            {article.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          </IconButton>
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': { color: theme.palette.primary.main }
                          }}
                          onClick={() => handleViewArticle(article.id)}
                        >
                          {article.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2 }}
                        >
                          {article.summary}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            src={article.authorAvatar}
                            alt={article.author}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          />
                          <Box>
                            <Typography variant="body2" component="span">
                              {article.author}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              color="text.secondary"
                            >
                              {article.authorRole}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon 
                              fontSize="small" 
                              sx={{ color: theme.palette.text.secondary, mr: 0.5 }} 
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                            >
                              {article.readTime} read
                            </Typography>
                          </Box>
                          {renderPopularity(article.popularity)}
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button
                          size="small"
                          endIcon={<ArrowIcon />}
                          onClick={() => handleViewArticle(article.id)}
                          aria-label={`Read ${article.title}`}
                        >
                          Read Article
                        </Button>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ ml: 'auto' }}
                        >
                          {formatDate(article.date)}
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
};

export default KnowledgeBase; 