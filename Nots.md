**Tawk.to Script**

```<!--Start of Tawk.to Script-->
<script type="text/javascript">
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    <% if(userInfo){ %>
    Tawk_API.visitor = {
        name: '<%= userInfo.name %>',
        email: '<%= userInfo.meta.email %>'
    };
    <% } %>
    (function () {
        var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/59f0da924854b82732ff7a4a/default';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
    })();
</script>
<!--End of Tawk.to Script-->```