import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, gradient }) => ({
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
}));

const IconWrapper = styled(Box)(({ theme, iconColor }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${iconColor}20 0%, ${iconColor}10 100%)`,
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 32,
    color: iconColor,
  },
}));

const EnhancedCard = ({
  title,
  description,
  icon,
  actions,
  status,
  gradient,
  iconColor = '#667eea',
  onClick,
  children,
  ...props
}) => {
  return (
    <StyledCard gradient={gradient} onClick={onClick} {...props}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <IconWrapper iconColor={iconColor}>
            {icon}
          </IconWrapper>
          {status && (
            <Chip
              label={status}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
        
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          {description}
        </Typography>
        
        {children}
      </CardContent>
      
      {actions && (
        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default EnhancedCard;
