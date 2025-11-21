package cc.common.data.transitory;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDomainAccess {
    private boolean research;

    private boolean teach;

    private boolean learn;

    public UserDomainAccess(boolean research, boolean teach, boolean learn) {
        this.research = research;
        this.teach = teach;
        this.learn = learn;
    }

    public boolean isResearch() {
        return research;
    }

    public void setResearch(boolean research) {
        this.research = research;
    }

    public boolean isTeach() {
        return teach;
    }

    public void setTeach(boolean teach) {
        this.teach = teach;
    }

    public boolean isLearn() {
        return learn;
    }

    public void setLearn(boolean learn) {
        this.learn = learn;
    }
}
