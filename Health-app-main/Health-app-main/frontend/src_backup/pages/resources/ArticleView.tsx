import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Button,
  IconButton,
  Skeleton,
  Paper,
  Breadcrumbs,
  Link,
  Avatar,
  useTheme,
  Alert,
  AlertTitle,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as BackIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import DOMPurify from 'dompurify';

// Extended Article type with full content
interface ArticleDetail {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  date: string;
  readTime: string;
  bookmarked: boolean;
  author: {
    name: string;
    avatarUrl: string;
    title: string;
  };
  relatedArticles: RelatedArticle[];
}

interface RelatedArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
}

const mockArticleContent = `
<h2>Introduction</h2>
<p>Blood pressure is a crucial vital sign that provides important information about your cardiovascular health. It's measured in millimeters of mercury (mmHg) and recorded as two numbers: systolic pressure (the higher number) over diastolic pressure (the lower number).</p>

<p>Understanding your blood pressure readings can help you make informed decisions about your health and lifestyle. This article explains what blood pressure numbers mean, what constitutes normal and abnormal readings, and what steps you can take to maintain healthy blood pressure.</p>

<h2>What Do Blood Pressure Numbers Mean?</h2>

<p>When your healthcare provider takes your blood pressure, they're measuring two distinct phases of your heart's pumping cycle:</p>

<ul>
  <li><strong>Systolic pressure (the top number):</strong> This represents the pressure in your arteries when your heart beats and pumps blood out.</li>
  <li><strong>Diastolic pressure (the bottom number):</strong> This represents the pressure in your arteries when your heart rests between beats.</li>
</ul>

<p>For example, if your blood pressure reading is 120/80 mmHg, your systolic pressure is 120 and your diastolic pressure is 80.</p>

<h2>Blood Pressure Categories</h2>

<p>According to the American Heart Association, blood pressure readings fall into these categories:</p>

<h3>Normal Blood Pressure</h3>
<p>Systolic: Less than 120 mmHg<br>
Diastolic: Less than 80 mmHg</p>

<p>This is the ideal blood pressure range that you should try to maintain through healthy lifestyle habits.</p>

<h3>Elevated Blood Pressure</h3>
<p>Systolic: 120-129 mmHg<br>
Diastolic: Less than 80 mmHg</p>

<p>This range indicates that you're at risk of developing hypertension unless you take steps to control it.</p>

<h3>Hypertension Stage 1</h3>
<p>Systolic: 130-139 mmHg<br>
Diastolic: 80-89 mmHg</p>

<p>At this stage, your doctor may suggest lifestyle changes and might consider prescribing medication based on your risk of cardiovascular disease.</p>

<h3>Hypertension Stage 2</h3>
<p>Systolic: 140 mmHg or higher<br>
Diastolic: 90 mmHg or higher</p>

<p>This more severe hypertension may require a combination of medications and lifestyle changes.</p>

<h3>Hypertensive Crisis</h3>
<p>Systolic: Higher than 180 mmHg<br>
Diastolic: Higher than 120 mmHg</p>

<p>This is an emergency situation requiring immediate medical attention. Contact your doctor immediately if you have these readings along with symptoms like chest pain, shortness of breath, back pain, numbness/weakness, change in vision, or difficulty speaking.</p>

<h2>Factors That Affect Blood Pressure Readings</h2>

<p>Blood pressure naturally fluctuates throughout the day, and readings can be affected by various factors:</p>

<ul>
  <li>Time of day (usually lowest when sleeping and rises upon waking)</li>
  <li>Stress or anxiety</li>
  <li>Physical activity</li>
  <li>Caffeine or alcohol consumption</li>
  <li>Smoking</li>
  <li>Full bladder</li>
  <li>Temperature</li>
</ul>

<p>For the most accurate readings, measure your blood pressure when you're relaxed, sitting with your back supported, legs uncrossed, and arm supported at heart level.</p>

<h2>Tips for Maintaining Healthy Blood Pressure</h2>

<p>If you're concerned about your blood pressure, these lifestyle modifications can help:</p>

<ul>
  <li><strong>Maintain a healthy weight:</strong> Even modest weight loss can help reduce blood pressure.</li>
  <li><strong>Exercise regularly:</strong> Aim for at least 150 minutes of moderate activity per week.</li>
  <li><strong>Eat a healthy diet:</strong> Follow the DASH (Dietary Approaches to Stop Hypertension) diet, which is rich in fruits, vegetables, whole grains, and low-fat dairy products.</li>
  <li><strong>Reduce sodium intake:</strong> Limit sodium to less than 2,300 mg per day (about 1 teaspoon of salt).</li>
  <li><strong>Limit alcohol consumption:</strong> No more than one drink per day for women and two for men.</li>
  <li><strong>Avoid smoking:</strong> Smoking raises blood pressure temporarily and damages blood vessels.</li>
  <li><strong>Manage stress:</strong> Practice relaxation techniques like deep breathing, meditation, or yoga.</li>
  <li><strong>Monitor your blood pressure at home:</strong> This can help you keep track of your progress and alert you to any changes.</li>
</ul>

<h2>When to See a Doctor</h2>

<p>If you have high blood pressure, it's important to work with your healthcare provider to monitor and manage it effectively. Schedule regular check-ups, and contact your doctor if:</p>

<ul>
  <li>Your blood pressure remains high despite treatment</li>
  <li>You experience side effects from blood pressure medications</li>
  <li>You have concerns about your blood pressure readings</li>
</ul>

<p>Remember that hypertension is often called the "silent killer" because it typically has no symptoms but can lead to serious health problems if left untreated.</p>

<h2>Conclusion</h2>

<p>Understanding your blood pressure readings is an important step in taking control of your cardiovascular health. By knowing what the numbers mean and making appropriate lifestyle changes, you can help keep your blood pressure in a healthy range and reduce your risk of heart disease, stroke, and other complications.</p>

<p>Regular monitoring and working closely with your healthcare provider are key to managing your blood pressure effectively. Don't hesitate to ask questions and seek guidance to ensure you're taking the right steps for your individual health needs.</p>
`;

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
    console.error("Error in ArticleView component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Alert severity="error">
            <AlertTitle>Error Displaying Article</AlertTitle>
            Something went wrong displaying this article.
            {this.state.error && (
              <Typography variant="body2">{this.state.error.message}</Typography>
            )}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry();
            }}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

const ArticleView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock data loading
  const loadArticleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!id) {
        throw new Error("Article ID is required");
      }

      // Mock article data based on ID
      const mockArticle: ArticleDetail = {
        id: id,
        title: 'Understanding Blood Pressure Readings',
        summary: 'Learn how to interpret your blood pressure numbers and what they mean for your overall health.',
        content: mockArticleContent,
        category: 'chronic',
        tags: ['Heart Health', 'Blood Pressure', 'Cardiovascular', 'Prevention', 'Monitoring'],
        imageUrl: 'https://source.unsplash.com/random/1200x600/?healthcare,heart',
        date: '2023-06-15',
        readTime: '5 min',
        bookmarked: false,
        author: {
          name: 'Dr. Sarah Johnson',
          avatarUrl: 'https://source.unsplash.com/random/100x100/?doctor',
          title: 'Cardiologist, MD'
        },
        relatedArticles: [
          {
            id: '7',
            title: 'The DASH Diet for Hypertension',
            summary: 'How dietary changes can help manage high blood pressure.',
            imageUrl: 'https://source.unsplash.com/random/400x300/?food',
            category: 'nutrition'
          },
          {
            id: '8',
            title: 'Exercise and Blood Pressure',
            summary: 'Regular physical activity can help lower and control blood pressure.',
            imageUrl: 'https://source.unsplash.com/random/400x300/?exercise',
            category: 'fitness'
          },
          {
            id: '9',
            title: 'Stress Management for Heart Health',
            summary: 'Techniques to reduce stress and improve cardiovascular health.',
            imageUrl: 'https://source.unsplash.com/random/400x300/?stress',
            category: 'mental-health'
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

  useEffect(() => {
    loadArticleData();
  }, [loadArticleData]);

  // Toggle bookmark status
  const handleToggleBookmark = useCallback(() => {
    setBookmarked(prev => !prev);
    // In a real app, would update the database
  }, []);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      // Web Share API if supported by browser
      if (navigator.share) {
        await navigator.share({
          title: article?.title || 'Article',
          text: article?.summary || '',
          url: window.location.href
        });
      } else {
        // Fallback to copy link
        handleCopyLink();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }, [article]);

  // Copy link to clipboard
  const handleCopyLink = useCallback(() => {
    try {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        });
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, []);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle navigation to related article
  const handleRelatedArticleClick = useCallback((relatedId: string) => {
    navigate(`/resources/${relatedId}`);
  }, [navigate]);

  // Handle rating article
  const handleRateArticle = useCallback((rating: number) => {
    setUserRating(rating);
    setShowRatingSuccess(true);
    setTimeout(() => setShowRatingSuccess(false), 3000);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }, []);

  // Go back to resources
  const handleBackClick = useCallback(() => {
    navigate('/resources');
  }, [navigate]);

  // Render rating stars
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

  // Loading skeleton
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

  if (loading) {
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
            to="/resources" 
            underline="hover"
          >
            Resources
          </Link>
          <Typography color="text.primary">Loading Article...</Typography>
        </Breadcrumbs>
        {renderArticleSkeleton()}
      </Container>
    );
  }

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
            to="/resources" 
            underline="hover"
          >
            Resources
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
              startIcon={<RefreshIcon />}
              onClick={loadArticleData}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Article</AlertTitle>
          {error.message}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            startIcon={<BackIcon />}
            onClick={handleBackClick}
          >
            Back to Resources
          </Button>
        </Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" align="center" sx={{ my: 8 }}>
          Article not found
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            startIcon={<BackIcon />}
            onClick={handleBackClick}
          >
            Back to Resources
          </Button>
        </Box>
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
            to="/resources" 
            underline="hover"
          >
            Resources
          </Link>
          <Typography color="text.primary">Article</Typography>
        </Breadcrumbs>

        {/* Article Header */}
        <Button 
          startIcon={<BackIcon />} 
          onClick={handleBackClick}
          sx={{ mb: 3 }}
          variant="outlined"
          aria-label="Back to articles"
        >
          Back to Resources
        </Button>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{ 
                p: { xs: 2, md: 4 },
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ mb: 4 }}>
                <CardMedia
                  component="img"
                  height={400}
                  image={article.imageUrl}
                  alt=""
                  aria-hidden="true"
                  sx={{ borderRadius: 1, mb: 3 }}
                />

                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                  {article.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {article.summary}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <Avatar src={article.author.avatarUrl} sx={{ width: 40, height: 40, mr: 1 }} alt={article.author.name} />
                    <Box>
                      <Typography variant="subtitle2">{article.author.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{article.author.title}</Typography>
                    </Box>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} aria-label="Date" />
                    <Typography variant="body2" sx={{ mr: 2 }}>{formatDate(article.date)}</Typography>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} aria-label="Reading time" />
                    <Typography variant="body2">{article.readTime} read</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {article.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    onClick={handleToggleBookmark}
                    size="small"
                    aria-label={bookmarked ? "Remove from saved articles" : "Save article"}
                  >
                    {bookmarked ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    size="small"
                    aria-label="Share article"
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    size="small"
                    aria-label="Print article"
                  >
                    Print
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Article Content */}
              <Box 
                id="printable-article"
                className="article-content" 
                ref={contentRef}
                sx={{ 
                  '& h2': { 
                    mt: 4, 
                    mb: 2,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: theme.palette.primary.main 
                  },
                  '& h3': { 
                    mt: 3, 
                    mb: 1.5,
                    fontSize: '1.25rem',
                    fontWeight: 500 
                  },
                  '& p': { 
                    mb: 2,
                    lineHeight: 1.7 
                  },
                  '& ul, & ol': { 
                    mb: 2,
                    pl: 3,
                    '& li': { 
                      mb: 1,
                      lineHeight: 1.7 
                    }
                  },
                  '& strong': {
                    fontWeight: 600
                  }
                }}
                dangerouslySetInnerHTML={createSanitizedHtml(article.content)}
                role="article"
                aria-labelledby="article-title"
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
                    onClick={handleBackClick}
                  >
                    Back to Resources
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

            {/* Author Info */}
            <Box sx={{ mt: 6, mb: 4 }}>
              <Typography variant="h5" gutterBottom>About the Author</Typography>
              <Card variant="outlined" sx={{ display: 'flex', p: 2 }}>
                <Avatar 
                  src={article.author.avatarUrl} 
                  sx={{ width: 80, height: 80, mr: 2 }} 
                  alt={article.author.name}
                />
                <Box>
                  <Typography variant="h6">{article.author.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {article.author.title}
                  </Typography>
                  <Typography variant="body2">
                    Dr. Johnson specializes in cardiovascular health and preventive medicine. 
                    She has over 15 years of experience in clinical practice and medical research, 
                    with a focus on hypertension management and patient education.
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Related Articles */}
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Related Articles
              </Typography>
              <Box>
                {article.relatedArticles.map((relatedArticle) => (
                  <Card 
                    key={relatedArticle.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    }}
                    onClick={() => handleRelatedArticleClick(relatedArticle.id)}
                    role="button"
                    aria-label={`Read related article: ${relatedArticle.title}`}
                  >
                    <CardMedia
                      component="img"
                      height={140}
                      image={relatedArticle.imageUrl}
                      alt=""
                      aria-hidden="true"
                    />
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Typography variant="subtitle1" component="h3" gutterBottom>
                        {relatedArticle.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {relatedArticle.summary}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>

            {/* Health Tools */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Health Tools
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                  aria-label="Open Blood Pressure Calculator"
                >
                  Blood Pressure Calculator
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start', mb: 1 }}
                  aria-label="Open Heart Disease Risk Assessment"
                >
                  Heart Disease Risk Assessment
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                  aria-label="Open Medication Reminder Setup"
                >
                  Medication Reminder Setup
                </Button>
              </Box>
            </Paper>

            {/* Quick Reference */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Blood Pressure Categories
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="success.main">Normal</Typography>
                <Typography variant="body2" gutterBottom>
                  Less than 120/80 mmHg
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="info.main">Elevated</Typography>
                <Typography variant="body2" gutterBottom>
                  120-129/Less than 80 mmHg
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="warning.main">Hypertension Stage 1</Typography>
                <Typography variant="body2" gutterBottom>
                  130-139/80-89 mmHg
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="error.main">Hypertension Stage 2</Typography>
                <Typography variant="body2" gutterBottom>
                  140+/90+ mmHg
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography variant="subtitle2" color="error.dark">Hypertensive Crisis</Typography>
                <Typography variant="body2" gutterBottom>
                  Higher than 180/120 mmHg
                </Typography>
              </Box>
            </Paper>
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