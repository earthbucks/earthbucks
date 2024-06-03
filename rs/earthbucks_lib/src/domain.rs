use regex::Regex;

pub struct Domain {
    domain_str: String,
}

impl Domain {
    pub fn new(domain_str: String) -> Self {
        Self { domain_str }
    }

    pub fn from_str(domain_str: String) -> Self {
        Self::new(domain_str)
    }

    pub fn is_valid(&self) -> bool {
        Self::is_valid_domain(&self.domain_str)
    }

    pub fn is_valid_domain(domain_str: &str) -> bool {
        let domain_str = domain_str.trim();
        if domain_str.len() < 4 {
            return false;
        }
        if domain_str.starts_with('.') {
            return false;
        }
        if domain_str.ends_with('.') {
            return false;
        }
        if !domain_str.contains('.') {
            return false;
        }
        if domain_str.contains("..") {
            return false;
        }
        let domain_parts: Vec<&str> = domain_str.split('.').collect();
        if domain_parts.len() < 2 {
            return false;
        }
        if domain_parts.len() > 10 {
            return false;
        }
        if domain_parts.iter().any(|&part| part.len() > 63) {
            return false;
        }
        let re = Regex::new(r"^[a-z0-9]+$").unwrap();
        if domain_parts.iter().any(|&part| !re.is_match(part)) {
            return false;
        }

        if domain_parts.iter().any(|&part| part.starts_with('-')) {
            return false;
        }
        if domain_parts.iter().any(|&part| part.ends_with('-')) {
            return false;
        }
        if domain_parts.iter().any(|&part| part.contains("--")) {
            return false;
        }
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid_domain() {
        assert!(Domain::from_str("earthbucks.com".to_string()).is_valid());
        assert!(!Domain::from_str("earthbucks.com.".to_string()).is_valid());
        assert!(!Domain::from_str(".earthbucks.com".to_string()).is_valid());
        assert!(Domain::from_str("node.node.node.node.earthbucks.com".to_string()).is_valid());
        assert!(!Domain::from_str(
            "node.node.node.node.node.node.node.node.node.earthbucks.com".to_string()
        )
        .is_valid());
    }
}
