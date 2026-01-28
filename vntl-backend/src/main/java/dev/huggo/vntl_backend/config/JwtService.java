package dev.huggo.vntl_backend.config;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.expiration}")
    private long expiration;

    /* =========================
       Token generation
       ========================= */

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .subject(userDetails.getUsername())
            // .setSubject(userDetails.getUsername())
            .claim(
                "role",
                userDetails.getAuthorities().iterator().next().getAuthority()
            )
            .issuedAt(new Date())
            // .setIssuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            // .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            // .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /* =========================
       Token validation
       ========================= */

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /* =========================
       Claims extraction
       ========================= */

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    /* =========================
       Signing key
       ========================= */

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

}
