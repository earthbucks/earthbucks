use earthbucks_lib::domain::Domain;

#[test]
fn test_is_valid_domain() {
    assert!(Domain::from_iso_str("earthbucks.com".to_string()).is_valid());
    assert!(!Domain::from_iso_str("earthbucks.com.".to_string()).is_valid());
    assert!(!Domain::from_iso_str(".earthbucks.com".to_string()).is_valid());
    assert!(Domain::from_iso_str("node.node.node.node.earthbucks.com".to_string()).is_valid());
    assert!(!Domain::from_iso_str(
        "node.node.node.node.node.node.node.node.node.earthbucks.com".to_string()
    )
    .is_valid());
}
