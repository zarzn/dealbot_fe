import Image from "next/image";
import SectionTitle from "@/components/Common/SectionTitle";
import { Github, Linkedin, Twitter } from "lucide-react";
import teamData from "./teamData";

const Team = () => {
  return (
    <section className="overflow-hidden py-20 bg-white/[0.02]">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <SectionTitle
          subTitle="Our Team"
          title="Meet the Innovators"
          paragraph="Our diverse team of experts combines AI technology, market research, and blockchain innovation to revolutionize how you discover and track deals."
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamData.map((member) => (
            <div 
              key={member.id}
              className="wow fadeInUp group"
              data-wow-delay={`${0.1 * (member.id % 4)}s`}
            >
              <div className="relative overflow-hidden rounded-xl bg-white/[0.05] p-6 backdrop-blur-sm transition hover:bg-white/[0.1]">
                <div className="relative mx-auto mb-6 h-[170px] w-[170px] overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition group-hover:scale-110"
                  />
                </div>

                <div className="text-center">
                  <h3 className="mb-1 text-lg font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="mb-2 text-sm text-purple">{member.designation}</p>
                  <p className="mb-4 text-sm text-white/70">{member.bio}</p>

                  <div className="flex items-center justify-center gap-5">
                    {member.links.twitter && (
                      <a
                        href={member.links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 transition hover:text-white"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {member.links.github && (
                      <a
                        href={member.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 transition hover:text-white"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {member.links.linkedin && (
                      <a
                        href={member.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 transition hover:text-white"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
