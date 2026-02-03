package du.tum.student.enterpriseassetmanager.config;

import du.tum.student.enterpriseassetmanager.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // 稍后我们在 Config 里定义它

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. 尝试从请求头获取 Authorization 信息
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. 如果没有 Token，或者格式不对（不是 Bearer 开头），直接放行
        // (Spring Security 后面的过滤器会发现它没身份，然后根据规则拒绝它)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 提取 Token (去掉 "Bearer " 前缀)
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);

        // 4. 如果 Token 里有用户名，且当前上下文里还没认证过 (防止重复认证)
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 从数据库加载用户详细信息
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 5. 验证 Token 是否合法
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // 6. 生成“合法通行证” (UsernamePasswordAuthenticationToken)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // 补充请求细节 (IP地址, Session ID等)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 7. 【关键】将通行证放入 SecurityContextHolder，表示“此人已登录”
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. 继续下一个过滤器
        filterChain.doFilter(request, response);
    }
}