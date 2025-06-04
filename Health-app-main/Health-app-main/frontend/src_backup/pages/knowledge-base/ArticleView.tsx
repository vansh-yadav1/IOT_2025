import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Avatar,
  Chip,
  Divider,
  Skeleton,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as BackIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreIcon,
  Description as DescriptionIcon,
  LocalHospital as MedicalIcon,
  Person as PersonIcon,
  Error as ErrorIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import DOMPurify from 'dompurify';

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
    console.error("Error in ArticleView component:", error, errorInfo);
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
            <AlertTitle>Error Loading Article</AlertTitle>
            {this.state.error?.message || "An unexpected error occurred"}
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
  content: string;
  summary: string;
  category: string;
  date: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  bookmarked: boolean;
  popularity: number; // 1-5 stars
  references: Array<{
    title: string;
    url: string;
  }>;
  relatedArticles: Array<{
    id: string;
    title: string;
    category: string;
    summary: string;
  }>;
}

// Categories mapping
const categories = {
  'general': {
    name: 'General Health',
    icon: <MedicalIcon color="primary" />,
  },
  'procedures': {
    name: 'Medical Procedures',
    icon: <DescriptionIcon color="primary" />,
  },
  'policies': {
    name: 'Hospital Policies',
    icon: <CategoryIcon color="primary" />,
  },
  'insurance': {
    name: 'Insurance',
    icon: <PersonIcon color="primary" />,
  }
};

const ArticleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load article data
  const loadArticleData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock article data
      const mockArticle: Article = {
        id: id,
        title: 'Understanding Your Lab Results: A Comprehensive Guide',
        content: `
          <h2>Introduction</h2>
          <p>Medical laboratory tests are an essential part of modern healthcare, providing valuable information that helps healthcare providers diagnose diseases, monitor treatment progress, and screen for health conditions. However, interpreting lab results can be confusing for patients without medical training.</p>
          
          <p>This guide will help you understand common laboratory tests, what the numbers mean, and when you should discuss results with your healthcare provider.</p>
          
          <h2>How to Read Your Lab Report</h2>
          <p>A typical lab report contains several standard elements:</p>
          <ul>
            <li><strong>Patient information:</strong> Your name, date of birth, and other identifying information</li>
            <li><strong>Test name:</strong> The specific test that was performed</li>
            <li><strong>Result:</strong> The measured value of the test</li>
            <li><strong>Reference range:</strong> The normal range for the test in a healthy population</li>
            <li><strong>Units:</strong> The measurement unit for the result</li>
            <li><strong>Flags:</strong> Indicators if a result is abnormal (often marked as H for high or L for low)</li>
          </ul>
          
          <h2>Common Laboratory Tests</h2>
          
          <h3>Complete Blood Count (CBC)</h3>
          <p>A CBC evaluates overall health and can detect a wide range of disorders including anemia, infection, and certain cancers. Key components include:</p>
          
          <h4>Red Blood Cells (RBCs)</h4>
          <p>RBCs carry oxygen throughout your body. Low levels may indicate anemia, while high levels could suggest dehydration or other conditions.</p>
          <p>Normal range (adults):</p>
          <ul>
            <li>Males: 4.5-5.9 million cells/mcL</li>
            <li>Females: 4.1-5.1 million cells/mcL</li>
          </ul>
          
          <h4>White Blood Cells (WBCs)</h4>
          <p>WBCs help fight infection. Elevated levels often indicate infection or inflammation, while low levels may suggest immune system issues.</p>
          <p>Normal range: 4,500-11,000 cells/mcL</p>
          
          <h4>Platelets</h4>
          <p>Platelets help your blood clot. Low platelet counts can lead to easy bruising and bleeding.</p>
          <p>Normal range: 150,000-450,000 platelets/mcL</p>
          
          <h4>Hemoglobin</h4>
          <p>This protein in red blood cells carries oxygen. Low levels indicate anemia.</p>
          <p>Normal range:</p>
          <ul>
            <li>Males: 13.5-17.5 g/dL</li>
            <li>Females: 12.0-15.5 g/dL</li>
          </ul>
          
          <h3>Basic Metabolic Panel (BMP)</h3>
          <p>This group of tests provides information about your body's metabolism and chemical balance. Key components include:</p>
          
          <h4>Glucose</h4>
          <p>Blood sugar levels that are too high may indicate diabetes, while low levels can cause weakness and confusion.</p>
          <p>Normal range (fasting): 70-99 mg/dL</p>
          
          <h4>Electrolytes</h4>
          <p>These include sodium, potassium, calcium, and chloride. They help maintain fluid balance and are essential for nerve and muscle function.</p>
          <p>Normal ranges:</p>
          <ul>
            <li>Sodium: 135-145 mmol/L</li>
            <li>Potassium: 3.5-5.0 mmol/L</li>
            <li>Calcium: 8.5-10.5 mg/dL</li>
            <li>Chloride: 96-106 mmol/L</li>
          </ul>
          
          <h4>Kidney Function Tests</h4>
          <p>Blood Urea Nitrogen (BUN) and creatinine assess how well your kidneys are working.</p>
          <p>Normal ranges:</p>
          <ul>
            <li>BUN: 7-20 mg/dL</li>
            <li>Creatinine: 0.6-1.2 mg/dL (males), 0.5-1.1 mg/dL (females)</li>
          </ul>
          
          <h3>Lipid Panel</h3>
          <p>This test measures fats in your blood that are associated with heart disease risk:</p>
          
          <h4>Total Cholesterol</h4>
          <p>Desirable: Less than 200 mg/dL</p>
          
          <h4>HDL Cholesterol ("Good" cholesterol)</h4>
          <p>Optimal: 60 mg/dL or higher</p>
          
          <h4>LDL Cholesterol ("Bad" cholesterol)</h4>
          <p>Optimal: Less than 100 mg/dL</p>
          
          <h4>Triglycerides</h4>
          <p>Optimal: Less than 150 mg/dL</p>
          
          <h3>Liver Function Tests</h3>
          <p>These tests assess liver health and function:</p>
          
          <h4>Alanine aminotransferase (ALT) and Aspartate aminotransferase (AST)</h4>
          <p>Elevated levels may indicate liver damage.</p>
          <p>Normal ranges:</p>
          <ul>
            <li>ALT: 7-56 units/L</li>
            <li>AST: 5-40 units/L</li>
          </ul>
          
          <h2>Understanding Results Outside Reference Ranges</h2>
          <p>If your results fall outside the reference range, it doesn't necessarily mean you have a medical problem. Several factors can affect test results:</p>
          <ul>
            <li>Diet and fasting status</li>
            <li>Medications</li>
            <li>Physical activity before the test</li>
            <li>Age and sex</li>
            <li>Underlying chronic conditions</li>
          </ul>
          
          <p>Your healthcare provider will interpret your results within the context of your overall health, medical history, and any symptoms you're experiencing.</p>
          
          <h2>When to Discuss Results with Your Doctor</h2>
          <p>You should discuss your lab results with your healthcare provider if:</p>
          <ul>
            <li>Results are significantly outside the reference range</li>
            <li>Results have changed notably from previous tests</li>
            <li>You're experiencing symptoms that might be related to the test results</li>
            <li>You're taking medications that might affect the test results</li>
          </ul>
          
          <h2>Conclusion</h2>
          <p>Understanding your lab results empowers you to take an active role in your healthcare. Remember that lab tests are just one tool your healthcare provider uses to assess your health. Always discuss your results and any concerns with your healthcare team for proper interpretation and guidance.</p>
        `,
        summary: 'A comprehensive guide to interpreting your laboratory test results and what different values mean for your health.',
        category: 'general',
        date: '2023-07-15',
        author: 'Dr. Sarah Johnson',
        authorRole: 'Laboratory Director',
        authorAvatar: '/assets/avatars/avatar1.jpg',
        readTime: '8 min',
        bookmarked: true,
        popularity: 5,
        references: [
          {
            title: 'American Board of Internal Medicine',
            url: 'https://www.abim.org'
          },
          {
            title: 'National Library of Medicine',
            url: 'https://www.nlm.nih.gov'
          },
          {
            title: 'Lab Tests Online',
            url: 'https://labtestsonline.org'
          }
        ],
        relatedArticles: [
          {
            id: '2',
            title: 'Preparing for Your Blood Test',
            category: 'procedures',
            summary: 'Tips and guidelines for preparing for your blood test to ensure accurate results.'
          },
          {
            id: '4',
            title: 'Managing Chronic Conditions',
            category: 'general',
            summary: 'Practical advice for patients living with and managing long-term chronic health conditions.'
          },
          {
            id: '6',
            title: 'Preventive Health Screenings',
            category: 'general',
            summary: 'Recommended preventive screenings by age and risk factors to help detect health issues early.'
          }
        ]
      };
      
      setArticle(mockArticle);
      setBookmarked(mockArticle.bookmarked);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load article'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load article on mount
  useEffect(() => {
    loadArticleData();
  }, [loadArticleData]);

  // Handle page print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Toggle bookmark status
  const handleToggleBookmark = useCallback(() => {
    setBookmarked(prev => !prev);
    // In a real application, you would save this to user preferences
  }, []);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        });
      } else {
        // Fallback to copy link
        handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [article]);

  // Copy article link to clipboard
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowCopySuccess(true);
    });
  }, []);

  // Handle user rating
  const handleRateArticle = useCallback((rating: number) => {
    setUserRating(rating);
    setShowRatingSuccess(true);
    // In a real application, you would save this rating to a database
  }, []);

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

  // Handle navigation back to knowledge base
  const handleBackToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  // Render article rating stars
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconButton
          key={i}
          size="small"
          onClick={() => handleRateArticle(i)}
          color={i <= userRating ? "primary" : "default"}
          aria-label={`Rate ${i} out of 5 stars`}
        >
          {i <= userRating ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
      );
    }
    return stars;
  };

  // Loading skeleton for article
  const renderArticleSkeleton = () => (
    <Box sx={{ mt: 4 }}>
      <Skeleton variant="text" height={60} width="80%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={80} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
      {[1, 2, 3, 4].map((_, index) => (
        <React.Fragment key={index}>
          <Skeleton variant="text" height={30} width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="100%" sx={{ mb: 0.5 }} />
          <Skeleton variant="text" height={20} width="100%" sx={{ mb: 0.5 }} />
          <Skeleton variant="text" height={20} width="90%" sx={{ mb: 2 }} />
        </React.Fragment>
      ))}
    </Box>
  );

  // Create sanitized HTML content
  const createSanitizedHtml = useCallback((unsafeHtml: string) => {
    try {
      return {
        __html: DOMPurify.sanitize(unsafeHtml)
      };
    } catch (err) {
      console.error('Error sanitizing HTML:', err);
      return { __html: '<p>Error displaying content</p>' };
    }
  }, []);

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
          <Link 
            component={RouterLink} 
            color="inherit" 
            to="/knowledge-base" 
            underline="hover"
          >
            Knowledge Base
          </Link>
          <Typography color="text.primary">Article</Typography>
        </Breadcrumbs>

        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={loadArticleData}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Article</AlertTitle>
          {error.message}
        </Alert>

        <Button
          startIcon={<BackIcon />}
          onClick={handleBackToKnowledgeBase}
          sx={{ mb: 2 }}
        >
          Back to Knowledge Base
        </Button>
      </Container>
    );
  }

  return (
    <ErrorBoundary onRetry={loadArticleData}>
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
          <Link 
            component={RouterLink} 
            color="inherit" 
            to="/knowledge-base" 
            underline="hover"
          >
            Knowledge Base
          </Link>
          <Typography color="text.primary">
            {loading ? 'Loading Article...' : article?.title || 'Article'}
          </Typography>
        </Breadcrumbs>

        {/* Back button */}
        <Button
          startIcon={<BackIcon />}
          onClick={handleBackToKnowledgeBase}
          sx={{ mb: 4 }}
          variant="outlined"
        >
          Back to Knowledge Base
        </Button>

        <Grid container spacing={4}>
          {/* Main content */}
          <Grid item xs={12} md={8}>
            {loading ? (
              renderArticleSkeleton()
            ) : article ? (
              <Paper
                elevation={0}
                sx={{ 
                  p: { xs: 2, md: 4 },
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {/* Article header */}
                <Box sx={{ mb: 4 }}>
                  <Chip 
                    label={categories[article.category as keyof typeof categories]?.name || article.category}
                    icon={categories[article.category as keyof typeof categories]?.icon}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {article.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={article.authorAvatar}
                      alt={article.author}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {article.author}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
                        {article.authorRole} • {formatDate(article.date)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      bgcolor: 'background.default',
                      p: 2,
                      borderRadius: 1,
                      mb: 3
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {article.readTime} read
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bookmark article">
                        <IconButton
                          onClick={handleToggleBookmark}
                          color={bookmarked ? "primary" : "default"}
                          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                          size="small"
                        >
                          {bookmarked ? <BookmarkedIcon /> : <BookmarkIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Share article">
                        <IconButton
                          onClick={handleShare}
                          aria-label="Share article"
                          size="small"
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Print article">
                        <IconButton
                          onClick={handlePrint}
                          aria-label="Print article"
                          size="small"
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Copy link">
                        <IconButton
                          onClick={handleCopyLink}
                          aria-label="Copy article link"
                          size="small"
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
                
                {/* Article content */}
                <Box
                  ref={contentRef}
                  className="article-content"
                  sx={{
                    '& h2': {
                      mt: 4,
                      mb: 2,
                      fontWeight: 600,
                      fontSize: '1.5rem'
                    },
                    '& h3': {
                      mt: 3,
                      mb: 1,
                      fontWeight: 600,
                      fontSize: '1.25rem'
                    },
                    '& h4': {
                      mt: 2,
                      mb: 1,
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    },
                    '& p': {
                      mb: 2,
                      lineHeight: 1.6
                    },
                    '& ul, & ol': {
                      mb: 2,
                      pl: 2
                    },
                    '& li': {
                      mb: 1
                    },
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    },
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto',
                      my: 2,
                      borderRadius: 1
                    },
                    '& table': {
                      width: '100%',
                      borderCollapse: 'collapse',
                      mb: 2
                    },
                    '& th, & td': {
                      border: `1px solid ${theme.palette.divider}`,
                      p: 1,
                      textAlign: 'left'
                    },
                    '& th': {
                      bgcolor: 'background.default'
                    }
                  }}
                  dangerouslySetInnerHTML={createSanitizedHtml(article.content)}
                />
                
                {/* Article footer */}
                <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" gutterBottom>
                    Was this article helpful?
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    {renderRatingStars()}
                    {userRating > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        You rated this {userRating} out of 5
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      startIcon={<BackIcon />}
                      onClick={handleBackToKnowledgeBase}
                    >
                      Back to Knowledge Base
                    </Button>
                    
                    <Button
                      onClick={handleShare}
                      startIcon={<ShareIcon />}
                    >
                      Share Article
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <ErrorIcon color="action" sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Article not found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The article you're looking for doesn't exist or has been removed.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleBackToKnowledgeBase}
                  startIcon={<BackIcon />}
                >
                  Back to Knowledge Base
                </Button>
              </Box>
            )}
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {loading ? (
              <Box>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={240} sx={{ mb: 3, borderRadius: 2 }} />
              </Box>
            ) : article ? (
              <>
                {/* Related Articles */}
                <Card 
                  elevation={0}
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Related Articles
                    </Typography>
                    <List disablePadding>
                      {article.relatedArticles.map((relatedArticle, index) => (
                        <React.Fragment key={relatedArticle.id}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem 
                            button
                            onClick={() => navigate(`/knowledge-base/article/${relatedArticle.id}`)}
                            sx={{ px: 0 }}
                          >
                            <ListItemText
                              primary={relatedArticle.title}
                              secondary={
                                <React.Fragment>
                                  <Chip 
                                    size="small" 
                                    label={categories[relatedArticle.category as keyof typeof categories]?.name || relatedArticle.category}
                                    sx={{ mr: 1, mt: 0.5 }}
                                  />
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {relatedArticle.summary.substring(0, 60)}...
                                  </Typography>
                                </React.Fragment>
                              }
                              primaryTypographyProps={{
                                fontWeight: 500,
                                color: 'primary',
                                gutterBottom: true
                              }}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
                
                {/* References */}
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      References
                    </Typography>
                    <List disablePadding>
                      {article.references.map((reference, index) => (
                        <React.Fragment key={reference.url}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem 
                            button
                            onClick={() => window.open(reference.url, '_blank')}
                            sx={{ px: 0 }}
                          >
                            <ListItemText
                              primary={reference.title}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {reference.url}
                                  </Typography>
                                </React.Fragment>
                              }
                              primaryTypographyProps={{
                                fontWeight: 500,
                                color: 'primary',
                                gutterBottom: true
                              }}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </Grid>
        </Grid>
      </Container>
      
      {/* Snackbar notifications */}
      <Snackbar
        open={showRatingSuccess}
        autoHideDuration={3000}
        onClose={() => setShowRatingSuccess(false)}
        message={`Thank you for rating this article ${userRating} out of 5!`}
      />
      
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        message="Link copied to clipboard!"
      />
    </ErrorBoundary>
  );
};

export default ArticleView;