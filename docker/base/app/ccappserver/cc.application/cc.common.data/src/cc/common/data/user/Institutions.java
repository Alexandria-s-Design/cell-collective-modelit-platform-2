package cc.common.data.user;

import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name = "\"Institutions\"")
public class Institutions {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "institutions_seq")
    @SequenceGenerator(name = "institutions_seq", sequenceName = "\"Institutions_id_seq\"", allocationSize = 1)
    private Integer id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "category", length = 25)
    private String category;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "country", length = 255)
    private String country;

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "domains")
    @ElementCollection
    private List<String> domains;

    @Column(name = "websites")
    @ElementCollection
    private List<String> websites;

    // Gettery a settery
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public List<String> getDomains() {
        return domains;
    }

    public void setDomains(List<String> domains) {
        this.domains = domains;
    }

    public List<String> getWebsites() {
        return websites;
    }

    public void setWebsites(List<String> websites) {
        this.websites = websites;
    }
}
