import com.example.todo_list.entity.Todo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MSSQLServerContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
public class TodoControllerIT {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    static MSSQLServerContainer<?> db =
            new MSSQLServerContainer<>("mcr.microsoft.com/mssql/server:2022-latest")
                    .acceptLicense();

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r){
        r.add("spring.datasource.url", db::getJdbcUrl);
        r.add("spring.datasource.username", db::getUsername);
        r.add("spring.datasource.password", db::getPassword);
        r.add("spring.jpa.hibernate.ddl-auto", () -> "update");

    }

    String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void postThenPatchCompleted_flow() {
        //POST /todos
        Todo payLoad = new Todo();
        payLoad.setTitle("end-to-end");
        payLoad.setCompleted(false);

        ResponseEntity<Todo> created = rest.postForEntity(url("/todos"), payLoad, Todo.class);

        assertEquals(HttpStatus.OK, created.getStatusCode());
        Long id = created.getBody().getId();

        // PATCH /todos/{id}/completed
        Todo patch = new Todo();
        patch.setCompleted(true);

        ResponseEntity<Todo> patched =
                rest.exchange(url("/todos/" + id + "/completed"),
                        HttpMethod.PATCH,
                        new HttpEntity<>(patch),
                        Todo.class);

        assertEquals(HttpStatus.OK, patched.getStatusCode());
        assertTrue(patched.getBody().isCompleted());

    }
}
