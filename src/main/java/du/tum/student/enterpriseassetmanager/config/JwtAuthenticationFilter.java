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
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. 尝试从请求头获取 Authorization 信息
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. 如果没有 Token，或者格式不对，直接放行
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. 提取 Token
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);

        // 4. 如果 Token 里有用户名，且当前上下文里还没认证过
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 从数据库加载用户详细信息 (这里会获取最新的 enabled 状态)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 5. 验证 Token 是否合法
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // ============================================================
                // [新增部分] Phase 3.1: 实时检查用户禁用状态
                // ============================================================
                if (!userDetails.isEnabled()) {
                    // 如果用户被禁用，返回 403 Forbidden 并终止请求
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"User account is disabled\"}");
                    return; // ⚠️ 非常重要：必须 return，阻止 filterChain 继续执行
                }
                // ============================================================

                // 6. 生成“合法通行证”
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. 将通行证放入 SecurityContextHolder
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. 继续下一个过滤器
        filterChain.doFilter(request, response);
    }
}